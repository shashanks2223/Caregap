from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_caregiver
from app.core.audit import log_audit
from app.models.user import User
from app.models.profile import CaregiverProfile
from app.models.insurance import Policy
from app.models.claim import Claim
from app.schemas.caregiver import CaregiverProfileCreate, CaregiverProfileUpdate, CaregiverProfileResponse

router = APIRouter(prefix="/api/caregivers", tags=["Caregivers"])

@router.get("/profile", response_model=CaregiverProfileResponse)
def get_caregiver_profile(
    profile: CaregiverProfile = Depends(get_current_caregiver)
):
    return profile

@router.put("/profile", response_model=CaregiverProfileResponse)
def update_caregiver_profile(
    profile_update: CaregiverProfileUpdate,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    log_audit(
        db=db,
        action="UPDATE_CAREGIVER_PROFILE",
        entity_type="caregiver_profile",
        entity_id=str(profile.id),
        user_id=profile.user_id,
        details={"updated_fields": list(update_data.keys())}
    )

    return profile

@router.post("/verify-bank")
def verify_bank_details(
    bank_name: str,
    bank_account_last4: str,
    ifsc_code: str,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    profile.bank_name = bank_name
    profile.bank_account_last4 = bank_account_last4
    profile.ifsc_code = ifsc_code
    profile.bank_verification_status = "verified"  # Simulated instant sandbox verification
    
    db.commit()
    db.refresh(profile)

    log_audit(
        db=db,
        action="VERIFY_BANK_ACCOUNT",
        entity_type="caregiver_profile",
        entity_id=str(profile.id),
        user_id=profile.user_id,
        details={"bank": bank_name, "last4": bank_account_last4}
    )

    return {
        "status": "verified",
        "message": "Bank account verified successfully for claim benefit payouts.",
        "bank_name": bank_name,
        "masked_account": f"XXXX-XXXX-{bank_account_last4}"
    }

@router.get("/dashboard-summary")
def get_caregiver_dashboard_summary(
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    active_policy = db.query(Policy).filter(
        Policy.caregiver_id == profile.id,
        Policy.status == "active"
    ).first()

    claims = db.query(Claim).filter(Claim.caregiver_id == profile.id).all()
    pending_claims_count = sum(1 for c in claims if c.status not in ["COMPLETED", "REJECTED"])

    return {
        "caregiver": {
            "name": profile.full_name,
            "category": profile.caregiver_category,
            "monthly_salary": profile.monthly_salary,
            "employment_type": profile.employment_type,
            "bank_status": profile.bank_verification_status
        },
        "active_policy": {
            "id": active_policy.id if active_policy else None,
            "policy_number": active_policy.policy_number if active_policy else None,
            "plan_name": active_policy.plan.name if (active_policy and active_policy.plan) else None,
            "coverage_type": active_policy.coverage_type if active_policy else None,
            "monthly_premium": active_policy.monthly_premium if active_policy else 0,
            "max_benefit": active_policy.max_monthly_benefit if active_policy else 0,
            "status": active_policy.status if active_policy else "No Active Policy",
            "renewal_date": active_policy.renewal_date if active_policy else None
        } if active_policy else None,
        "claims_summary": {
            "total_claims": len(claims),
            "pending_claims": pending_claims_count,
            "approved_claims": sum(1 for c in claims if c.status in ["APPROVED", "COMPLETED"])
        }
    }

