from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EmployerProfileCreate(BaseModel):
    organization_name: str
    organization_type: str = "Care Agency"
    contact_person: str
    mobile_number: str
    registration_number: Optional[str] = None
    address: str
    city: str
    state: str
    pin_code: str

class EmployerProfileUpdate(BaseModel):
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    contact_person: Optional[str] = None
    mobile_number: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None

class EmployerProfileResponse(BaseModel):
    id: int
    user_id: int
    organization_name: str
    organization_type: str
    contact_person: str
    mobile_number: str
    registration_number: Optional[str] = None
    address: str
    city: str
    state: str
    pin_code: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmployerCaregiverAdd(BaseModel):
    caregiver_email: str
    role_title: str = "Senior Caregiver"
    start_date: str
    monthly_salary: float
