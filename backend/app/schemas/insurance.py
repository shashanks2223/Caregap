from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class PlanResponse(BaseModel):
    id: int
    plan_code: str
    name: str
    description: str
    coverage_option: str
    monthly_premium: float
    base_option_a_premium: float
    option_b_premium: float
    additional_benefits_premium: float
    max_option_a_duration_days: int
    max_option_b_duration_days: int
    option_a_waiting_period_days: int
    option_b_waiting_period_days: int
    min_qualifying_employment_months: int
    coverage_limit_multiplier: float
    exclusions: List[str] = []
    eligibility_conditions: List[str] = []
    is_active: bool

    class Config:
        from_attributes = True

class PlanCreateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    monthly_premium: Optional[float] = None
    base_option_a_premium: Optional[float] = None
    option_b_premium: Optional[float] = None
    additional_benefits_premium: Optional[float] = None
    max_option_a_duration_days: Optional[int] = None
    max_option_b_duration_days: Optional[int] = None
    option_a_waiting_period_days: Optional[int] = None
    option_b_waiting_period_days: Optional[int] = None
    min_qualifying_employment_months: Optional[int] = None
    exclusions: Optional[List[str]] = None
    eligibility_conditions: Optional[List[str]] = None
    is_active: Optional[bool] = None

class PolicyCoverageResponse(BaseModel):
    id: int
    coverage_type: str
    benefit_percentage: float
    max_duration_days: int
    current_utilized_days: int
    coverage_amount: float
    terms: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class PolicyResponse(BaseModel):
    id: int
    policy_number: str
    caregiver_id: int
    plan_id: int
    plan: Optional[PlanResponse] = None
    coverage_type: str
    status: str
    start_date: datetime
    renewal_date: datetime
    waiting_period_ends_at: datetime
    monthly_premium: float
    max_monthly_benefit: float
    declared_monthly_salary: float
    terms_accepted: bool
    coverages: List[PolicyCoverageResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class PolicyCreate(BaseModel):
    plan_id: int
    coverage_type: str = "COMBINED"  # OPTION_A, OPTION_B, COMBINED
    terms_accepted: bool = True

class PremiumCalculationRequest(BaseModel):
    monthly_salary: float
    caregiver_category: str
    employment_type: str
    years_experience: float
    selected_plan_id: Optional[int] = None
    coverage_type: str = "COMBINED"  # OPTION_A, OPTION_B, COMBINED
    declared_risks: List[str] = []

class PremiumCalculationResponse(BaseModel):
    monthly_salary: float
    coverage_type: str
    base_premium: float
    category_factor: float
    tenure_discount: float
    risk_adjustment: float
    final_monthly_premium: float
    max_monthly_benefit: float
    calculation_breakdown: Dict[str, Any]
    recommendation_summary: str
    is_prototype: bool = True
