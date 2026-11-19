from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.core.audit import log_audit
from app.models.user import User
from app.models.profile import CaregiverProfile, EmployerProfile
from app.models.insurance import Policy, InsurancePlan, RiskAssessment
from app.models.claim import Claim
from app.models.audit import AuditLog
from app.schemas.admin import AdminStatsResponse, FraudAlertResponse

router = APIRouter(prefix="/api/admin", tags=["Administration"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_caregivers = db.query(CaregiverProfile).count()
    total_employers = db.query(EmployerProfile).count()
    active_policies = db.query(Policy).filter(Policy.status == "active").count()
    
    total_claims = db.query(Claim).count()
    pending_claims = db.query(Claim).filter(Claim.status.in_(["SUBMITTED", "DOCUMENT_VERIFICATION", "EMPLOYMENT_VERIFICATION", "UNDER_REVIEW"])).count()
    approved_claims = db.query(Claim).filter(Claim.status.in_(["APPROVED", "COMPLETED"])).count()
    rejected_claims = db.query(Claim).filter(Claim.status == "REJECTED").count()
    
    # Calculate illustrative monthly revenue from active policies
    revenue = db.query(func.sum(Policy.monthly_premium)).filter(Policy.status == "active").scalar() or 0.0
    fraud_count = db.query(Claim).filter(Claim.fraud_flag == True).count()

    return {
        "total_caregivers": total_caregivers,
        "total_employers": total_employers,
        "active_policies": active_policies,
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "illustrative_revenue_monthly": round(float(revenue), 2),
        "fraud_alerts_count": fraud_count
    }

@router.get("/caregivers")
def list_admin_caregivers(
    search: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(CaregiverProfile)
    if search:
        query = query.filter(CaregiverProfile.full_name.ilike(f"%{search}%") | CaregiverProfile.city.ilike(f"%{search}%"))
    if category:
        query = query.filter(CaregiverProfile.caregiver_category == category)
        
    records = query.offset(skip).limit(limit).all()
    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "full_name": c.full_name,
            "mobile": c.mobile_number,
            "city": c.city,
            "state": c.state,
            "category": c.caregiver_category,
            "experience": c.years_experience,
            "monthly_salary": c.monthly_salary,
            "employment_type": c.employment_type,
            "employer_name": c.employer_name,
            "bank_status": c.bank_verification_status,
            "active_policy": any(p.status == "active" for p in c.policies),
            "created_at": c.created_at
        }
        for c in records
    ]

@router.get("/employers")
def list_admin_employers(
    search: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(EmployerProfile)
    if search:
        query = query.filter(EmployerProfile.organization_name.ilike(f"%{search}%") | EmployerProfile.city.ilike(f"%{search}%"))
    records = query.all()
    return [
        {
            "id": e.id,
            "organization_name": e.organization_name,
            "organization_type": e.organization_type,
            "contact_person": e.contact_person,
            "mobile_number": e.mobile_number,
            "city": e.city,
            "is_verified": e.is_verified,
            "affiliated_caregivers": len(e.employment_records)
        }
        for e in records
    ]

@router.put("/employers/{employer_id}/verify")
def toggle_employer_verification(
    employer_id: int,
    verified: bool,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    emp = db.query(EmployerProfile).filter(EmployerProfile.id == employer_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employer not found.")

    emp.is_verified = verified
    db.commit()

    log_audit(
        db=db,
        action="VERIFY_EMPLOYER_ORGANIZATION",
        entity_type="employer_profile",
        entity_id=str(emp.id),
        user_id=admin.id,
        details={"verified": verified}
    )
    return {"message": f"Employer verification updated to {verified}."}

@router.get("/fraud-alerts")
def get_fraud_alerts(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    claims = db.query(Claim).filter(Claim.fraud_flag == True).all()
    return [
        {
            "claim_id": c.id,
            "claim_number": c.claim_number,
            "caregiver_name": c.caregiver.full_name,
            "claim_type": c.claim_type,
            "flagged_reasons": c.fraud_reasons,
            "status": c.status,
            "claimed_amount": c.calculated_benefit_amount,
            "created_at": c.created_at
        }
        for c in claims
    ]

@router.get("/audit-logs")
def get_system_audit_logs(
    limit: int = 100,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user.email if l.user else "System",
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "created_at": l.created_at
        }
        for l in logs
    ]

