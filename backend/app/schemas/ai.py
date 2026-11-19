from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RiskAssessmentRequest(BaseModel):
    caregiver_id: Optional[int] = None
    caregiver_category: str
    employment_type: str
    years_experience: float
    monthly_salary: float
    employment_duration_months: int = 12
    declared_risks: List[str] = []
    selected_coverage: str = "COMBINED"

class RiskAssessmentResponse(BaseModel):
    risk_category: str  # LOW, MODERATE, HIGH
    risk_score: int  # 0 to 100
    risk_factors: List[str] = []
    recommendations: List[str] = []
    explanation: str
    assessed_by_ai: bool = True
    is_prototype_indicator: bool = True

class ChatbotMessage(BaseModel):
    role: str  # user or model
    content: str

class ChatbotRequest(BaseModel):
    message: str
    conversation_history: List[ChatbotMessage] = []

class ChatbotResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    referenced_plans: List[str] = []

class ClaimAnalysisResponse(BaseModel):
    claim_id: int
    missing_documents: List[str] = []
    extracted_summary: Dict[str, Any] = {}
    consistency_score: int = 90
    inconsistencies: List[str] = []
    admin_summary: str
    recommended_decision_support: str
