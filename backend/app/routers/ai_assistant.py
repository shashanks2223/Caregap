from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.insurance import InsurancePlan, Policy
from app.models.claim import Claim
from app.schemas.ai import ChatbotRequest, ChatbotResponse, ClaimAnalysisResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/ai-assistant", tags=["AI Insurance Assistant"])

@router.post("/chat", response_model=ChatbotResponse)
def chat_with_assistant(
    req: ChatbotRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user context
    user_context = {"role": user.role, "name": user.email.split("@")[0].capitalize()}
    if user.role == "caregiver" and user.caregiver_profile:
        user_context["name"] = user.caregiver_profile.full_name
        active_pol = db.query(Policy).filter(
            Policy.caregiver_id == user.caregiver_profile.id,
            Policy.status == "active"
        ).first()
        if active_pol:
            user_context["active_policy"] = f"{active_pol.plan.name} ({active_pol.coverage_type}) - ₹{active_pol.max_monthly_benefit}/mo"

    # Fetch available plans
    plans = db.query(InsurancePlan).filter(InsurancePlan.is_active == True).all()
    plans_data = [
        {"name": p.name, "plan_code": p.plan_code, "monthly_premium": p.monthly_premium, "coverage_option": p.coverage_option}
        for p in plans
    ]

    res = gemini_service.chat_response(
        message=req.message,
        user_context=user_context,
        available_plans=plans_data
    )
    return res

@router.get("/claim-analysis/{claim_id}", response_model=ClaimAnalysisResponse)
def analyze_claim_ai(
    claim_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    doc_names = [d.file_name for d in claim.documents]
    reason = claim.incident_description if claim.claim_type == "OPTION_A" else (claim.termination_reason or "")
    
    analysis = gemini_service.analyze_claim(
        claim_type=claim.claim_type,
        claimed_salary=claim.claimed_salary,
        documents_uploaded=doc_names,
        incident_or_term_reason=reason,
        interruption_days=claim.benefit_duration_days
    )

    return {
        "claim_id": claim.id,
        "missing_documents": analysis["missing_documents"],
        "extracted_summary": {
            "claim_number": claim.claim_number,
            "claim_type": claim.claim_type,
            "status": claim.status,
            "duration_days": claim.benefit_duration_days,
            "calculated_benefit": claim.calculated_benefit_amount
        },
        "consistency_score": analysis["consistency_score"],
        "inconsistencies": analysis["inconsistencies"],
        "admin_summary": analysis["admin_summary"],
        "recommended_decision_support": analysis["recommended_decision_support"]
    }

