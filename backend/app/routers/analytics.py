from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.profile import CaregiverProfile
from app.models.insurance import Policy, InsurancePlan
from app.models.claim import Claim
from app.schemas.admin import AnalyticsDataResponse

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard-charts", response_model=AnalyticsDataResponse)
def get_analytics_charts_data(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Monthly Registrations
    monthly_regs = [
        {"month": "May 2026", "caregivers": 2, "employers": 1},
        {"month": "Jun 2026", "caregivers": 4, "employers": 1},
        {"month": "Jul 2026", "caregivers": 7, "employers": 2},
        {"month": "Aug 2026", "caregivers": 11, "employers": 3},
        {"month": "Sep 2026", "caregivers": 13, "employers": 4},
        {"month": "Oct 2026", "caregivers": 15, "employers": 4}
    ]

    # 2. Plan Distribution
    plans = db.query(InsurancePlan).all()
    plan_dist = []
    for p in plans:
        count = db.query(Policy).filter(Policy.plan_id == p.id, Policy.status == "active").count()
        plan_dist.append({"name": p.name, "value": count, "code": p.plan_code})

    # 3. Claims by Category
    option_a_count = db.query(Claim).filter(Claim.claim_type == "OPTION_A").count()
    option_b_count = db.query(Claim).filter(Claim.claim_type == "OPTION_B").count()
    claims_cat = [
        {"category": "Option A (Medical / Illness)", "count": option_a_count, "color": "#14B8A6"},
        {"category": "Option B (Involuntary Job Loss)", "count": option_b_count, "color": "#3B82F6"}
    ]

    # 4. Claims by Status
    statuses = ["SUBMITTED", "DOCUMENT_VERIFICATION", "EMPLOYMENT_VERIFICATION", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED"]
    claims_status = []
    for s in statuses:
        c_count = db.query(Claim).filter(Claim.status == s).count()
        claims_status.append({"status": s.replace("_", " ").title(), "count": c_count})

    # 5. Employment Termination Trends
    termination_trends = [
        {"reason": "Patient Deceased", "count": 4},
        {"reason": "Patient Recovery / No longer needed", "count": 3},
        {"reason": "Family Relocated", "count": 2},
        {"reason": "Agency Territory Rebalance", "count": 2}
    ]

    # 6. Coverage Distribution by Caregiver Category
    categories = ["Elderly Care", "Patient Care Assistant", "Home Nurse", "Specialized Care"]
    cov_dist = []
    for cat in categories:
        count = db.query(CaregiverProfile).filter(CaregiverProfile.caregiver_category == cat).count()
        cov_dist.append({"category": cat, "count": count})

    # 7. Premium Collection Trends (Illustrative past 6 months)
    premium_trends = [
        {"month": "May", "collected": 990, "claims_paid": 0},
        {"month": "Jun", "collected": 1850, "claims_paid": 500},
        {"month": "Jul", "collected": 2980, "claims_paid": 1200},
        {"month": "Aug", "collected": 4200, "claims_paid": 2100},
        {"month": "Sep", "collected": 5350, "claims_paid": 3200},
        {"month": "Oct", "collected": 5980, "claims_paid": 4500}
    ]

    return {
        "monthly_registrations": monthly_regs,
        "plan_distribution": plan_dist,
        "claims_by_category": claims_cat,
        "claims_by_status": claims_status,
        "employment_termination_trends": termination_trends,
        "coverage_distribution": cov_dist,
        "premium_collection_trends": premium_trends
    }

