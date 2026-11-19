from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_caregiver
from app.models.employment import EmploymentRecord, SalaryRecord
from app.models.profile import CaregiverProfile
from app.models.user import User

router = APIRouter(prefix="/api/employment", tags=["Employment Records"])

@router.get("/records")
def get_caregiver_employment_records(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role == "caregiver":
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
        if not cg:
            return []
        records = db.query(EmploymentRecord).filter(EmploymentRecord.caregiver_id == cg.id).all()
    else:
        records = db.query(EmploymentRecord).all()
        
    return [
        {
            "id": r.id,
            "employer_name": r.employer_name,
            "role_title": r.role_title,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "is_current": r.is_current,
            "status": r.status,
            "employer_verified": r.employer_verified,
            "termination_reason": r.termination_reason
        }
        for r in records
    ]

@router.post("/records")
def add_employment_record(
    employer_name: str,
    role_title: str,
    start_date: str,
    is_current: bool = True,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    rec = EmploymentRecord(
        caregiver_id=profile.id,
        employer_name=employer_name,
        role_title=role_title,
        start_date=start_date,
        is_current=is_current,
        status="active" if is_current else "completed"
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"message": "Employment record created.", "id": rec.id}

