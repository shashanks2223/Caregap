from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_caregiver
from app.models.employment import SalaryRecord, EmploymentRecord
from app.models.profile import CaregiverProfile
from app.models.user import User

router = APIRouter(prefix="/api/salary", tags=["Salary Records"])

@router.get("/records")
def get_salary_records(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role == "caregiver":
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
        if not cg:
            return []
        records = db.query(SalaryRecord).filter(SalaryRecord.caregiver_id == cg.id).order_by(SalaryRecord.year.desc(), SalaryRecord.month.desc()).all()
    else:
        records = db.query(SalaryRecord).order_by(SalaryRecord.created_at.desc()).limit(50).all()

    return [
        {
            "id": s.id,
            "month": s.month,
            "year": s.year,
            "declared_salary": s.declared_salary,
            "verified_salary": s.verified_salary,
            "is_verified": s.is_verified,
            "created_at": s.created_at
        }
        for s in records
    ]

@router.post("/records")
def add_salary_record(
    month: int,
    year: int,
    declared_salary: float,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    sal = SalaryRecord(
        caregiver_id=profile.id,
        month=month,
        year=year,
        declared_salary=declared_salary,
        verified_salary=declared_salary,
        is_verified=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(sal)
    # Update profile salary as latest
    profile.monthly_salary = declared_salary
    db.commit()
    db.refresh(sal)
    return {"message": "Salary record recorded and verified.", "id": sal.id}

