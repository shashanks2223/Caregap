from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.core.audit import log_audit
from app.models.insurance import RiskAssessment, Policy
from app.models.profile import CaregiverProfile
from app.models.user import User
from app.schemas.ai import RiskAssessmentRequest, RiskAssessmentResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/risk-assessment", tags=["AI Risk Assessment"])

@router.post("/evaluate", response_model=RiskAssessmentResponse)
def evaluate_risk(
    req: RiskAssessmentRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cg = None
    if req.caregiver_id:
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.id == req.caregiver_id).first()
    elif user.role == "caregiver":
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()

    # Call Gemini service (or graceful fallback)
    eval_result = gemini_service.assess_risk(
        category=req.caregiver_category,
        employment_type=req.employment_type,
        years_experience=req.years_experience,
        monthly_salary=req.monthly_salary,
        employment_duration_months=req.employment_duration_months,
        declared_risks=req.declared_risks,
        coverage_type=req.selected_coverage
    )

    if cg:
        # Save record
        ra = RiskAssessment(
            caregiver_id=cg.id,
            risk_category=eval_result["risk_category"],
            risk_score=eval_result["risk_score"],
            risk_factors=eval_result["risk_factors"],
            recommendations=eval_result["recommendations"],
            explanation=eval_result["explanation"],
            assessed_by_ai=eval_result.get("assessed_by_ai", True),
            human_reviewed=False
        )
        db.add(ra)
        db.commit()

        log_audit(
            db=db,
            action="GENERATE_RISK_ASSESSMENT",
            entity_type="risk_assessment",
            entity_id=str(ra.id),
            user_id=user.id,
            details={"category": eval_result["risk_category"], "score": eval_result["risk_score"]}
        )

    return eval_result

@router.get("/history")
def get_risk_assessment_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user.role == "caregiver":
        cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
        if not cg:
            return []
        records = db.query(RiskAssessment).filter(RiskAssessment.caregiver_id == cg.id).order_by(RiskAssessment.created_at.desc()).all()
    else:
        records = db.query(RiskAssessment).order_by(RiskAssessment.created_at.desc()).limit(50).all()

    return [
        {
            "id": r.id,
            "caregiver_name": r.caregiver.full_name if r.caregiver else "Unknown",
            "risk_category": r.risk_category,
            "risk_score": r.risk_score,
            "risk_factors": r.risk_factors,
            "recommendations": r.recommendations,
            "explanation": r.explanation,
            "assessed_by_ai": r.assessed_by_ai,
            "human_reviewed": r.human_reviewed,
            "reviewer_notes": r.reviewer_notes,
            "created_at": r.created_at
        }
        for r in records
    ]

@router.put("/review/{assessment_id}")
def update_human_review(
    assessment_id: int,
    reviewer_notes: str,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ra = db.query(RiskAssessment).filter(RiskAssessment.id == assessment_id).first()
    if not ra:
        raise HTTPException(status_code=404, detail="Risk assessment record not found.")

    ra.human_reviewed = True
    ra.human_reviewer_id = admin.id
    ra.reviewer_notes = reviewer_notes
    db.commit()

    log_audit(
        db=db,
        action="HUMAN_REVIEW_RISK_ASSESSMENT",
        entity_type="risk_assessment",
        entity_id=str(ra.id),
        user_id=admin.id,
        details={"notes": reviewer_notes}
    )

    return {"message": "Human underwriter review recorded."}

