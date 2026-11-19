from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.core.audit import log_audit
from app.models.insurance import InsurancePlan
from app.models.user import User
from app.schemas.insurance import PlanResponse, PlanCreateUpdate

router = APIRouter(prefix="/api/plans", tags=["Insurance Plans"])

@router.get("", response_model=List[PlanResponse])
def get_insurance_plans(db: Session = Depends(get_db)):
    plans = db.query(InsurancePlan).filter(InsurancePlan.is_active == True).all()
    return plans

@router.get("/{plan_id}", response_model=PlanResponse)
def get_plan_by_id(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")
    return plan

@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan_configuration(
    plan_id: int,
    plan_update: PlanCreateUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    plan = db.query(InsurancePlan).filter(InsurancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    update_data = plan_update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(plan, k, v)

    db.commit()
    db.refresh(plan)

    log_audit(
        db=db,
        action="UPDATE_INSURANCE_PLAN_CONFIG",
        entity_type="insurance_plan",
        entity_id=str(plan.id),
        user_id=admin.id,
        details={"updated_keys": list(update_data.keys())}
    )

    return plan

