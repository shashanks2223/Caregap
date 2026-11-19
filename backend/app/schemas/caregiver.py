from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class CaregiverProfileCreate(BaseModel):
    full_name: str
    mobile_number: str
    date_of_birth: Optional[str] = None
    city: str
    state: str
    pin_code: str
    caregiver_category: str = "Elderly Care"  # Elderly Care, Home Nurse, Patient Care Assistant, Specialized Care
    years_experience: float = 1.0
    monthly_salary: float = 18000.0
    employment_type: str = "Full-Time Agency"  # Full-Time Agency, Direct Family Contract, Part-Time Multiple Homes, Freelance/Independent
    employer_name: Optional[str] = None
    employment_start_date: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_last4: Optional[str] = None
    ifsc_code: Optional[str] = None

class CaregiverProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    caregiver_category: Optional[str] = None
    years_experience: Optional[float] = None
    monthly_salary: Optional[float] = None
    employment_type: Optional[str] = None
    employer_name: Optional[str] = None
    employment_start_date: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_last4: Optional[str] = None
    ifsc_code: Optional[str] = None
    bank_verification_status: Optional[str] = None

class CaregiverProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    mobile_number: str
    date_of_birth: Optional[str] = None
    city: str
    state: str
    pin_code: str
    caregiver_category: str
    years_experience: float
    monthly_salary: float
    employment_type: str
    employer_name: Optional[str] = None
    employment_start_date: Optional[str] = None
    bank_verification_status: str
    bank_name: Optional[str] = None
    bank_account_last4: Optional[str] = None
    ifsc_code: Optional[str] = None
    verification_documents: List[Any] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
