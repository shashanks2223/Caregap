from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_caregiver, get_current_admin
from app.core.audit import log_audit
from app.models.claim import Claim, ClaimDocument, ClaimReview
from app.models.insurance import Policy
from app.models.profile import CaregiverProfile, EmployerProfile
from app.models.user import User
from app.schemas.claim import ClaimCreateA, ClaimCreateB, ClaimResponse, ClaimStatusUpdate
from app.services.claim_service import ClaimService
from app.services.eligibility_engine import EligibilityEngine
from app.services.notification_service import NotificationService
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/claims", tags=["Claims Management"])

@router.get("", response_model=List[ClaimResponse])
def get_claims(
    user: User = Depends(get_current_user),
    status_filter: Optional[str] = None,
    claim_type_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Claim)
    
    if user.role == "caregiver":
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
        if not cg:
            return []
        query = query.filter(Claim.caregiver_id == cg.id)
    elif user.role == "employer":
        emp = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
        if not emp:
            return []
        # STRICT PRIVACY: Employer only sees Option B termination claims
        query = query.filter(Claim.employer_id == emp.id, Claim.claim_type == "OPTION_B")
    
    if status_filter:
        query = query.filter(Claim.status == status_filter)
    if claim_type_filter:
        query = query.filter(Claim.claim_type == claim_type_filter)

    return query.order_by(Claim.created_at.desc()).all()

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim_by_id(
    claim_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim record not found.")

    # Privacy check
    if user.role == "caregiver" and claim.caregiver.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this claim.")
    if user.role == "employer" and (claim.employer_id != user.employer_profile.id or claim.claim_type != "OPTION_B"):
        raise HTTPException(status_code=403, detail="Unauthorized: Employers can only view Option B records.")

    return claim

@router.post("/submit-option-a", response_model=ClaimResponse)
def submit_option_a_claim(
    data: ClaimCreateA,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == data.policy_id,
        Policy.caregiver_id == profile.id
    ).first()

    if not policy or policy.status != "active":
        raise HTTPException(status_code=400, detail="An active policy is required to file a claim.")

    if policy.coverage_type not in ["OPTION_A", "COMBINED", "COMBINED_PREMIUM"]:
        raise HTTPException(status_code=400, detail="Your current policy does not include Option A medical protection.")

    claim = ClaimService.create_claim_a(
        db=db,
        caregiver_profile=profile,
        policy=policy,
        incident_date=data.incident_date,
        incident_description=data.incident_description,
        interruption_start_date=data.interruption_start_date,
        expected_recovery_date=data.expected_recovery_date,
        claimed_salary=data.claimed_salary
    )
    return claim

@router.post("/submit-option-b", response_model=ClaimResponse)
def submit_option_b_claim(
    data: ClaimCreateB,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(
        Policy.id == data.policy_id,
        Policy.caregiver_id == profile.id
    ).first()

    if not policy or policy.status != "active":
        raise HTTPException(status_code=400, detail="An active policy is required to file a claim.")

    if policy.coverage_type not in ["OPTION_B", "COMBINED", "COMBINED_PREMIUM"]:
        raise HTTPException(status_code=400, detail="Your current policy does not include Option B employment continuity protection.")

    claim = ClaimService.create_claim_b(
        db=db,
        caregiver_profile=profile,
        policy=policy,
        termination_date=data.termination_date,
        termination_reason=data.termination_reason,
        employer_name=data.employer_name,
        employer_contact=data.employer_contact,
        last_working_date=data.last_working_date,
        previous_monthly_salary=data.previous_monthly_salary,
        claimed_salary=data.claimed_salary
    )
    return claim

@router.post("/evaluate-eligibility/{claim_id}")
def evaluate_claim_eligibility(
    claim_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    if claim.claim_type == "OPTION_A":
        result = EligibilityEngine.evaluate_option_a_claim(
            policy=claim.policy,
            interruption_days=claim.benefit_duration_days,
            incident_date_str=claim.incident_date or claim.interruption_start_date or "2026-10-01"
        )
    else:
        result = EligibilityEngine.evaluate_option_b_claim(
            policy=claim.policy,
            termination_reason=claim.termination_reason or "",
            tenure_months=int(claim.caregiver.years_experience * 12),
            termination_date_str=claim.termination_date or "2026-10-01"
        )
    return result

@router.put("/{claim_id}/status", response_model=ClaimResponse)
def update_claim_status(
    claim_id: int,
    update_data: ClaimStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    claim.status = update_data.status
    if update_data.admin_notes:
        claim.admin_notes = update_data.admin_notes
    if update_data.rejection_reason:
        claim.rejection_reason = update_data.rejection_reason
    if update_data.approved_benefit_amount is not None:
        claim.approved_benefit_amount = update_data.approved_benefit_amount
    elif update_data.status in ["APPROVED", "COMPLETED"] and claim.approved_benefit_amount is None:
        claim.approved_benefit_amount = claim.calculated_benefit_amount

    if update_data.status in ["APPROVED", "REJECTED", "COMPLETED"]:
        claim.decision_date = datetime.now(timezone.utc)

    # Add Review entry
    review = ClaimReview(
        claim_id=claim.id,
        reviewer_id=admin.id,
        review_type="admin_review",
        status=update_data.status,
        comments=update_data.admin_notes or update_data.rejection_reason
    )
    db.add(review)
    db.commit()
    db.refresh(claim)

    # Notify Caregiver
    NotificationService.send_notification(
        db=db,
        user_id=claim.caregiver.user_id,
        title=f"Claim Status Updated: {update_data.status}",
        message=f"Your claim {claim.claim_number} is now marked as {update_data.status}. {update_data.admin_notes or ''}",
        notification_type="claim",
        metadata={"claim_id": claim.id, "status": update_data.status}
    )

    log_audit(
        db=db,
        action="UPDATE_CLAIM_STATUS",
        entity_type="claim",
        entity_id=str(claim.id),
        user_id=admin.id,
        details={"status": update_data.status, "approved_amount": claim.approved_benefit_amount}
    )

    return claim

