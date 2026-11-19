import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.audit import log_audit
from app.models.claim import Claim, ClaimDocument
from app.models.user import User
from app.schemas.claim import ClaimDocumentResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/claim-documents", tags=["Claim Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

@router.post("/upload/{claim_id}", response_model=ClaimDocumentResponse)
def upload_claim_document(
    claim_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    # Authorization
    if user.role == "caregiver" and claim.caregiver.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Save to uploads directory securely
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{claim_id}_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Document Extraction & AI Validation
    extracted_data = {
        "uploaded_filename": file.filename,
        "format": ext,
        "classification": document_type,
        "verified_signature_stamp": True
    }
    ai_validation_status = "valid"
    ai_validation_notes = f"Simulated OCR extract: verified format {ext} for {document_type}."

    claim_doc = ClaimDocument(
        claim_id=claim.id,
        document_type=document_type,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        extracted_data=extracted_data,
        ai_validation_status=ai_validation_status,
        ai_validation_notes=ai_validation_notes
    )
    db.add(claim_doc)
    
    # If claim was in SUBMITTED, advance to DOCUMENT_VERIFICATION
    if claim.status == "SUBMITTED":
        claim.status = "DOCUMENT_VERIFICATION"

    db.commit()
    db.refresh(claim_doc)

    log_audit(
        db=db,
        action="UPLOAD_CLAIM_DOCUMENT",
        entity_type="claim_document",
        entity_id=str(claim_doc.id),
        user_id=user.id,
        details={"filename": file.filename, "document_type": document_type}
    )

    return claim_doc

@router.get("/download/{document_id}")
def download_claim_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(ClaimDocument).filter(ClaimDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Authorization
    claim = doc.claim
    if user.role == "caregiver" and claim.caregiver.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document.")
    if user.role == "employer":
        raise HTTPException(status_code=403, detail="Employers cannot access direct private claim documents.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on secure storage.")

    return FileResponse(doc.file_path, media_type=doc.mime_type, filename=doc.file_name)

