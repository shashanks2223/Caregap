import pytest
from app.services.premium_engine import PremiumEngine

def test_premium_engine_option_a():
    result = PremiumEngine.calculate_premium(
        monthly_salary=18000.0,
        caregiver_category="Elderly Care",
        employment_type="Full-Time Agency",
        years_experience=2.0,
        coverage_type="OPTION_A"
    )
    assert result["base_premium"] == 199.0
    assert result["coverage_type"] == "OPTION_A"
    assert result["final_monthly_premium"] >= 199.0
    assert result["max_monthly_benefit"] == 18000.0

def test_premium_engine_combined_plus():
    result = PremiumEngine.calculate_premium(
        monthly_salary=22000.0,
        caregiver_category="Elderly Care",
        employment_type="Full-Time Agency",
        years_experience=1.0,
        coverage_type="COMBINED"
    )
    # Base Option A (199) + Base Option B (150) = 349
    assert result["base_premium"] == 349.0
    assert result["final_monthly_premium"] == 349.0

def test_premium_engine_tenure_discount():
    result_senior = PremiumEngine.calculate_premium(
        monthly_salary=25000.0,
        caregiver_category="Elderly Care",
        employment_type="Full-Time Agency",
        years_experience=6.0,
        coverage_type="COMBINED"
    )
    assert result_senior["tenure_discount"] > 0
    # 10% discount on 349 is approx 34.90
    assert result_senior["final_monthly_premium"] < 349.0

