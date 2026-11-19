from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.core.database import get_db
from app.core.dependencies import get_current_employer
from app.core.audit import log_audit
from app.models.profile import EmployerProfile, CaregiverProfile
from app.models.employment import EmploymentRecord, SalaryRecord
from app.models.claim import Claim, ClaimReview
from app.models.user import User
from app.schemas.employer import EmployerProfileCreate, EmployerProfileUpdate, EmployerProfileResponse, EmployerCaregiverAdd
from app.schemas.claim import EmployerVerificationRequest
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/employers", tags=["Employers"])

@router.get("/profile", response_model=EmployerProfileResponse)
def get_employer_profile(
    profile: EmployerProfile = Depends(get_current_employer)
):
    return profile

@router.put("/profile", response_model=EmployerProfileResponse)
def update_employer_profile(
    profile_update: EmployerProfileUpdate,
    profile: EmployerProfile = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    log_audit(
        db=db,
        action="UPDATE_EMPLOYER_PROFILE",
        entity_type="employer_profile",
        entity_id=str(profile.id),
        user_id=profile.user_id,
        details={"organization": profile.organization_name}
    )

    return profile

@router.get("/caregivers")
def list_employer_caregivers(
    profile: EmployerProfile = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    """
    List caregivers affiliated with this agency/employer.
    """
    records = db.query(EmploymentRecord).filter(
        EmploymentRecord.employer_id == profile.id
    ).all()

    result = []
    for r in records:
        cg = r.caregiver
        result.append({
            "employment_id": r.id,
            "caregiver_id": cg.id,
            "full_name": cg.full_name,
            "category": cg.caregiver_category,
            "monthly_salary": cg.monthly_salary,
            "role_title": r.role_title,
            "start_date": r.start_date,
            "status": r.status,
            "is_current": r.is_current,
            "employer_verified": r.employer_verified,
            "active_protection": any(p.status == "active" for p in cg.policies)
        })
    return result

@router.post("/add-caregiver")
def add_caregiver_employment(
    data: EmployerCaregiverAdd,
    profile: EmployerProfile = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(User.email == data.caregiver_email, User.role == "caregiver").first()
    if not user or not user.caregiver_profile:
        raise HTTPException(
            status_code=404,
            detail=f"No registered caregiver found with email {data.caregiver_email}. They must register first."
        )

    cg = user.caregiver_profile

    # Check if existing employment record
    existing = db.query(EmploymentRecord).filter(
        EmploymentRecord.caregiver_id == cg.id,
        EmploymentRecord.employer_id == profile.id,
        EmploymentRecord.is_current == True
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Active employment record already exists for this caregiver in your agency."
        )

    new_emp = EmploymentRecord(
        caregiver_id=cg.id,
        employer_id=profile.id,
        employer_name=profile.organization_name,
        role_title=data.role_title,
        start_date=data.start_date,
        is_current=True,
        status="active",
        employer_verified=True
    )
    db.add(new_emp)

    # Update caregiver's employer name and salary if set
    cg.employer_name = profile.organization_name
    cg.monthly_salary = data.monthly_salary

    db.commit()
    db.refresh(new_emp)

    NotificationService.send_notification(
        db=db,
        user_id=cg.user_id,
        title="Employment Record Linked",
        message=f"{profile.organization_name} has linked your caregiver profile with verified employment status.",
        notification_type="verification"
    )

    log_audit(
        db=db,
        action="LINK_CAREGIVER_EMPLOYMENT",
        entity_type="employment_record",
        entity_id=str(new_emp.id),
        user_id=profile.user_id,
        details={"caregiver_id": cg.id, "salary": data.monthly_salary}
    )

    return {"message": "Caregiver successfully linked with verified employment status."}

@router.get("/verification-requests")
def get_pending_claim_verifications(
    profile: EmployerProfile = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    """
    Get Option B employment termination claims requiring employer confirmation.
    PRIVACY GUARANTEE: Does NOT expose Option A illness/medical records.
    """
    claims = db.query(Claim).filter(
        Claim.employer_id == profile.id,
        Claim.claim_type == "OPTION_B",
        Claim.status.in_(["EMPLOYMENT_VERIFICATION", "UNDER_REVIEW"])
    ).all()

    result = []
    for c in claims:
        result.append({
            "claim_id": c.id,
            "claim_number": c.claim_number,
            "caregiver_name": c.caregiver.full_name,
            "claimed_termination_date": c.termination_date,
            "claimed_reason": c.termination_reason,
            "last_working_date": c.last_working_date,
            "previous_salary": c.previous_monthly_salary,
            "employer_verified": c.employer_verified,
            "status": c.status
        })
    return result

@router.post("/verify-termination/{claim_id}")
def verify_employment_termination(
    claim_id: int,
    verif_data: EmployerVerificationRequest,
    profile: EmployerProfile = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(
        Claim.id == claim_id,
        Claim.employer_id == profile.id,
        Claim.claim_type == "OPTION_B"
    ).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found or not assigned to your agency.")

    claim.employer_verified = verif_data.confirmed_termination
    claim.employer_notes = verif_data.employer_notes
    if verif_data.confirmed_termination:
        claim.status = "UNDER_REVIEW"  # Move to admin adjudicator review
    else:
        claim.status = "UNDER_REVIEW"
        claim.fraud_flag = True
        claim.fraud_reasons = (claim.fraud_reasons or []) + ["Employer disputed termination veracity."]

    review = ClaimReview(
        claim_id=claim.id,
        reviewer_id=profile.user_id,
        review_type="employer_verification",
        status="CONFIRMED" if verif_data.confirmed_termination else "DISPUTED",
        comments=verif_data.employer_notes,
        flags=["employer_disputed"] if not verif_data.confirmed_termination else []
    )
    db.add(review)
    db.commit()

    NotificationService.send_notification(
        db=db,
        user_id=claim.caregiver.user_id,
        title="Employer Verification Update",
        message=f"{profile.organization_name} has responded to your claim verification request.",
        notification_type="claim"
    )

    log_audit(
        db=db,
        action="EMPLOYER_VERIFY_CLAIM",
        entity_type="claim",
        entity_id=str(claim.id),
        user_id=profile.user_id,
        details={"confirmed": verif_data.confirmed_termination}
    )

    return {"message": "Verification successfully recorded and sent to underwriting."}

