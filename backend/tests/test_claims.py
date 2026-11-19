import pytest
from app.core.database import SessionLocal
from app.models.insurance import Policy
from app.models.profile import CaregiverProfile
from app.models.claim import Claim
from app.services.claim_service import ClaimService
from app.services.eligibility_engine import EligibilityEngine

def test_claim_service_number_generation():
    db = SessionLocal()
    try:
        claim_num = ClaimService.generate_claim_number(db)
        assert claim_num.startswith("CG-CLM-")
        
        pol_num = ClaimService.generate_policy_number(db)
        assert pol_num.startswith("CG-POL-")
    finally:
        db.close()

def test_seeded_claims_exist():
    db = SessionLocal()
    try:
        claims = db.query(Claim).all()
        assert len(claims) >= 10
        statuses = set(c.status for c in claims)
        assert "APPROVED" in statuses
        assert "REJECTED" in statuses
        assert "UNDER_REVIEW" in statuses
    finally:
        db.close()

def test_eligibility_engine_option_a_duration_cap():
    db = SessionLocal()
    try:
        pol = db.query(Policy).first()
        res = EligibilityEngine.evaluate_option_a_claim(
            policy=pol,
            interruption_days=45,
            incident_date_str="2026-10-01"
        )
        assert res["is_eligible"] is True
        assert res["billable_days"] <= 60
        assert res["calculated_benefit"] > 0
    finally:
        db.close()

def test_eligibility_engine_option_b_exclusion():
    db = SessionLocal()
    try:
        pol = db.query(Policy).first()
        res = EligibilityEngine.evaluate_option_b_claim(
            policy=pol,
            termination_reason="Voluntary resignation to pursue other interests",
            tenure_months=12,
            termination_date_str="2026-10-01"
        )
        assert res["is_eligible"] is False
        assert any("Exclusion" in f for f in res["failed_checks"])
    finally:
        db.close()

def test_eligibility_engine_option_b_qualifying():
    db = SessionLocal()
    try:
        pol = db.query(Policy).first()
        res = EligibilityEngine.evaluate_option_b_claim(
            policy=pol,
            termination_reason="Patient recovered / household service contract ended",
            tenure_months=12,
            termination_date_str="2026-10-01"
        )
        assert res["is_eligible"] is True
        assert res["calculated_benefit"] > 0
    finally:
        db.close()
