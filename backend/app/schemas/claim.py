from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ClaimCreateA(BaseModel):
    policy_id: int
    incident_date: str
    incident_description: str
    interruption_start_date: str
    expected_recovery_date: str
    claimed_salary: float

class ClaimCreateB(BaseModel):
    policy_id: int
    termination_date: str
    termination_reason: str
    employer_name: Optional[str] = None
    employer_contact: Optional[str] = None
    last_working_date: str
    previous_monthly_salary: float
    claimed_salary: float

class ClaimCreatePlacementGap(BaseModel):
    policy_id: int
    signup_date: str
    agency_or_platform: Optional[str] = "CareGap Network Agency"
    days_unassigned: int = 15
    claimed_salary: float
    notes: Optional[str] = "Signed up but not provided with caregiving employment for 15+ days."

class ClaimDocumentResponse(BaseModel):
    id: int
    claim_id: int
    document_type: str
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    extracted_data: Dict[str, Any] = {}
    ai_validation_status: str
    ai_validation_notes: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ClaimReviewResponse(BaseModel):
    id: int
    claim_id: int
    reviewer_id: Optional[int]
    review_type: str
    status: str
    comments: Optional[str] = None
    flags: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimResponse(BaseModel):
    id: int
    claim_number: str
    policy_id: int
    caregiver_id: int
    claim_type: str
    incident_date: Optional[str] = None
    incident_description: Optional[str] = None
    interruption_start_date: Optional[str] = None
    expected_recovery_date: Optional[str] = None
    termination_date: Optional[str] = None
    termination_reason: Optional[str] = None
    employer_id: Optional[int] = None
    employer_name: Optional[str] = None
    employer_contact: Optional[str] = None
    last_working_date: Optional[str] = None
    previous_monthly_salary: Optional[float] = None
    signup_date: Optional[str] = None
    days_unassigned: Optional[int] = None
    claimed_salary: float
    calculated_benefit_amount: float
    approved_benefit_amount: Optional[float] = None
    benefit_duration_days: int
    status: str
    admin_notes: Optional[str] = None
    employer_notes: Optional[str] = None
    employer_verified: bool
    rejection_reason: Optional[str] = None
    fraud_flag: bool
    fraud_reasons: List[str] = []
    ai_summary: Optional[str] = None
    decision_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    documents: List[ClaimDocumentResponse] = []
    reviews: List[ClaimReviewResponse] = []

    class Config:
        from_attributes = True

class ClaimStatusUpdate(BaseModel):
    status: str  # SUBMITTED, DOCUMENT_VERIFICATION, EMPLOYMENT_VERIFICATION, UNDER_REVIEW, APPROVED, REJECTED, COMPLETED
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_benefit_amount: Optional[float] = None

class EmployerVerificationRequest(BaseModel):
    confirmed_termination: bool
    termination_reason_valid: bool
    last_working_date: Optional[str] = None
    employer_notes: Optional[str] = None
