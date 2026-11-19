from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.insurance import InsurancePlan, PremiumCalculation
from app.models.profile import CaregiverProfile
from app.models.user import User
from app.schemas.insurance import PremiumCalculationRequest, PremiumCalculationResponse
from app.services.premium_engine import PremiumEngine
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/premiums", tags=["Premium Engine"])

@router.post("/calculate", response_model=PremiumCalculationResponse)
def calculate_premium(
    data: PremiumCalculationRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = None
    if data.selected_plan_id:
        plan = db.query(InsurancePlan).filter(InsurancePlan.id == data.selected_plan_id).first()

    # Deterministic base calculation
    result = PremiumEngine.calculate_premium(
        monthly_salary=data.monthly_salary,
        caregiver_category=data.caregiver_category,
        employment_type=data.employment_type,
        years_experience=data.years_experience,
        coverage_type=data.coverage_type,
        declared_risks=data.declared_risks,
        plan=plan
    )

    # If caregiver profile exists, save the calculation record
    cg = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == user.id).first()
    if cg:
        calc_record = PremiumCalculation(
            caregiver_id=cg.id,
            calculated_for_salary=data.monthly_salary,
            selected_plan_id=data.selected_plan_id,
            selected_coverage=data.coverage_type,
            base_rate=result["base_premium"],
            category_factor=result["category_factor"],
            tenure_discount=result["tenure_discount"],
            risk_adjustment=result["risk_adjustment"],
            final_calculated_premium=result["final_monthly_premium"],
            calculation_breakdown=result["calculation_breakdown"]
        )
        db.add(calc_record)
        db.commit()

    return result

