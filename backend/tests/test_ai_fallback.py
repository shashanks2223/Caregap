import pytest
from app.services.gemini_service import gemini_service

def test_risk_assessment_fallback():
    result = gemini_service.assess_risk(
        category="Elderly Care",
        employment_type="Full-Time Agency",
        years_experience=3.5,
        monthly_salary=20000.0,
        employment_duration_months=18,
        declared_risks=["Night Shift Patient Care"],
        coverage_type="COMBINED"
    )
    assert "risk_category" in result
    assert result["risk_category"] in ["LOW", "MODERATE", "HIGH"]
    assert 0 <= result["risk_score"] <= 100
    assert len(result["risk_factors"]) > 0
    assert len(result["recommendations"]) > 0
    assert "explanation" in result

def test_claim_document_analysis():
    result = gemini_service.analyze_claim(
        claim_type="OPTION_A",
        claimed_salary=18000.0,
        documents_uploaded=["Medical Incapacity Certificate.pdf"],
        incident_or_term_reason="Sprained wrist during patient transfer",
        interruption_days=15
    )
    assert "missing_documents" in result
    assert "consistency_score" in result
    assert "admin_summary" in result

def test_chatbot_knowledge_response():
    result = gemini_service.chat_response(
        message="What is Option B and how much does it cost?",
        user_context={"role": "caregiver", "name": "Pooja"}
    )
    assert "reply" in result
    assert "Option B" in result["reply"] or "employment" in result["reply"].lower()
    assert len(result["suggested_actions"]) > 0

