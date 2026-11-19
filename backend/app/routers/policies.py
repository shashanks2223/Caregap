from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_caregiver
from app.core.audit import log_audit
from app.models.insurance import Policy, PolicyCoverage, InsurancePlan
from app.models.profile import CaregiverProfile
from app.models.user import User
from app.schemas.insurance import PolicyResponse, PolicyCreate
from app.services.claim_service import ClaimService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/policies", tags=["Policies"])

@router.get("", response_model=List[PolicyResponse])
def get_user_policies(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role == "caregiver":
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
        if not cg:
            return []
        return db.query(Policy).filter(Policy.caregiver_id == cg.id).order_by(Policy.created_at.desc()).all()
    else:
        return db.query(Policy).order_by(Policy.created_at.desc()).limit(50).all()

@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy_detail(
    policy_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")

    if user.role == "caregiver" and policy.caregiver.user_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to policy record.")

    return policy

@router.post("/purchase", response_model=PolicyResponse)
def purchase_prototype_policy(
    data: PolicyCreate,
    profile: CaregiverProfile = Depends(get_current_caregiver),
    db: Session = Depends(get_db)
):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == data.plan_id).first()
    if not plan or not plan.is_active:
        raise HTTPException(status_code=400, detail="Invalid or inactive plan selected.")

    # Calculate policy dates
    now = datetime.now(timezone.utc)
    waiting_days = plan.option_a_waiting_period_days if data.coverage_type == "OPTION_A" else max(plan.option_a_waiting_period_days, plan.option_b_waiting_period_days)
    waiting_period_ends_at = now + timedelta(days=waiting_days)
    renewal_date = now + timedelta(days=365)

    policy_number = ClaimService.generate_policy_number(db)

    # Determine monthly premium based on selected coverage
    if data.coverage_type == "OPTION_A":
        premium = plan.base_option_a_premium
    elif data.coverage_type == "OPTION_B":
        premium = plan.option_b_premium
    else:
        premium = plan.monthly_premium

    new_policy = Policy(
        policy_number=policy_number,
        caregiver_id=profile.id,
        plan_id=plan.id,
        coverage_type=data.coverage_type,
        status="active",
        start_date=now,
        renewal_date=renewal_date,
        waiting_period_ends_at=waiting_period_ends_at,
        monthly_premium=premium,
        max_monthly_benefit=profile.monthly_salary,
        declared_monthly_salary=profile.monthly_salary,
        terms_accepted=data.terms_accepted
    )
    db.add(new_policy)
    db.flush()

    # Coverages
    if data.coverage_type in ["OPTION_A", "COMBINED", "COMBINED_PREMIUM"]:
        cov_a = PolicyCoverage(
            policy_id=new_policy.id,
            coverage_type="OPTION_A",
            benefit_percentage=100.0,
            max_duration_days=plan.max_option_a_duration_days,
            current_utilized_days=0,
            coverage_amount=profile.monthly_salary,
            terms={"waiting_period_days": plan.option_a_waiting_period_days}
        )
        db.add(cov_a)

    if data.coverage_type in ["OPTION_B", "COMBINED", "COMBINED_PREMIUM"]:
        cov_b = PolicyCoverage(
            policy_id=new_policy.id,
            coverage_type="OPTION_B",
            benefit_percentage=100.0,
            max_duration_days=plan.max_option_b_duration_days,
            current_utilized_days=0,
            coverage_amount=profile.monthly_salary,
            terms={"waiting_period_days": plan.option_b_waiting_period_days}
        )
        db.add(cov_b)

    db.commit()
    db.refresh(new_policy)

    NotificationService.send_notification(
        db=db,
        user_id=profile.user_id,
        title="Prototype Policy Activated",
        message=f"Your policy {policy_number} ({plan.name}) is active. Coverage amount: ₹{profile.monthly_salary:,.0f}/month.",
        notification_type="policy",
        metadata={"policy_id": new_policy.id}
    )

    log_audit(
        db=db,
        action="PURCHASE_POLICY",
        entity_type="policy",
        entity_id=str(new_policy.id),
        user_id=profile.user_id,
        details={"policy_number": policy_number, "plan": plan.name, "premium": premium}
    )

    return new_policy

@router.get("/{policy_id}/download-summary")
def download_policy_summary(
    policy_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")

    cg = policy.caregiver
    return {
        "policy_number": policy.policy_number,
        "insured_caregiver": cg.full_name,
        "caregiver_category": cg.caregiver_category,
        "coverage_type": policy.coverage_type,
        "plan_name": policy.plan.name,
        "status": policy.status,
        "monthly_premium": f"₹{policy.monthly_premium:,.2f}",
        "max_monthly_benefit": f"₹{policy.max_monthly_benefit:,.2f}",
        "start_date": policy.start_date.strftime("%Y-%m-%d"),
        "renewal_date": policy.renewal_date.strftime("%Y-%m-%d"),
        "waiting_period_ends_at": policy.waiting_period_ends_at.strftime("%Y-%m-%d"),
        "academic_prototype_disclaimer": "IMPORTANT: This document is an academic insurance technology prototype summary for demonstration purposes only. It is not an actual underwritten insurance policy contract under Indian regulatory law."
    }

