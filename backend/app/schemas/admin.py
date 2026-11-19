from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class AdminStatsResponse(BaseModel):
    total_caregivers: int
    total_employers: int
    active_policies: int
    total_claims: int
    pending_claims: int
    approved_claims: int
    rejected_claims: int
    illustrative_revenue_monthly: float
    fraud_alerts_count: int

class AnalyticsDataResponse(BaseModel):
    monthly_registrations: List[Dict[str, Any]]
    plan_distribution: List[Dict[str, Any]]
    claims_by_category: List[Dict[str, Any]]
    claims_by_status: List[Dict[str, Any]]
    employment_termination_trends: List[Dict[str, Any]]
    coverage_distribution: List[Dict[str, Any]]
    premium_collection_trends: List[Dict[str, Any]]

class FraudAlertResponse(BaseModel):
    claim_id: int
    claim_number: str
    caregiver_name: str
    flagged_reasons: List[str]
    status: str
    created_at: datetime
