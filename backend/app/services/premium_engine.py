from typing import Dict, Any, List, Optional
from app.models.insurance import InsurancePlan

class PremiumEngine:
    @staticmethod
    def calculate_premium(
        monthly_salary: float,
        caregiver_category: str,
        employment_type: str,
        years_experience: float,
        coverage_type: str = "COMBINED",
        declared_risks: Optional[List[str]] = None,
        plan: Optional[InsurancePlan] = None
    ) -> Dict[str, Any]:
        """
        Deterministic calculation engine for prototype income protection premiums.
        Follows transparent rules with configurable plan parameters.
        """
        declared_risks = declared_risks or []
        
        # Base pricing parameters from plan or default illustrative baseline
        if plan:
            base_option_a = plan.base_option_a_premium
            base_option_b = plan.option_b_premium
            base_premium_perks = plan.additional_benefits_premium
        else:
            base_option_a = 199.0
            base_option_b = 150.0
            base_premium_perks = 150.0
            
        if coverage_type == "OPTION_A":
            base_premium = base_option_a
        elif coverage_type == "OPTION_B":
            base_premium = base_option_b
        elif coverage_type == "PREMIUM":
            base_premium = base_option_a + base_option_b + base_premium_perks
        else:  # COMBINED / PLUS
            base_premium = base_option_a + base_option_b

        # 1. Category Factor
        category_multipliers = {
            "Elderly Care": 1.0,
            "Patient Care Assistant": 1.05,
            "Home Nurse": 1.10,
            "Specialized Care": 1.15
        }
        cat_factor = category_multipliers.get(caregiver_category, 1.0)
        
        # 2. Experience / Tenure Discount (Stability incentive)
        if years_experience >= 5:
            tenure_discount_pct = 0.10  # 10% discount
        elif years_experience >= 3:
            tenure_discount_pct = 0.05  # 5% discount
        else:
            tenure_discount_pct = 0.0
            
        tenure_discount_amount = round(base_premium * tenure_discount_pct, 2)

        # 3. Risk Adjustment based on declared occupational factors
        risk_adjustment_amount = 0.0
        if "Night Shift Patient Care" in declared_risks:
            risk_adjustment_amount += 20.0
        if "High-Dependency Patient Handling" in declared_risks:
            risk_adjustment_amount += 25.0
        if "Frequent Multi-Home Travel" in declared_risks:
            risk_adjustment_amount += 15.0

        # Subtotal calculation
        adjusted_base = (base_premium * cat_factor) - tenure_discount_amount + risk_adjustment_amount
        final_premium = max(99.0, round(adjusted_base, 0))

        # Max monthly protection calculation (typically up to 100% of declared monthly salary)
        max_monthly_benefit = round(monthly_salary * 1.0, 2)

        breakdown = {
            "base_premium": round(base_premium, 2),
            "coverage_type": coverage_type,
            "caregiver_category": caregiver_category,
            "category_factor": cat_factor,
            "years_experience": years_experience,
            "tenure_discount_applied": tenure_discount_amount,
            "risk_adjustment_applied": risk_adjustment_amount,
            "declared_risks_considered": declared_risks,
            "final_monthly_premium": final_premium,
            "max_monthly_benefit": max_monthly_benefit,
            "illustrative_daily_benefit": round(max_monthly_benefit / 30.0, 2)
        }

        recommendation = (
            f"Based on your profile as a {caregiver_category} with {years_experience} years of experience "
            f"and salary of ₹{monthly_salary:,.0f}, we recommend the {coverage_type} package. "
            f"This guarantees up to ₹{max_monthly_benefit:,.0f}/month replacement during qualified income interruptions."
        )

        return {
            "monthly_salary": monthly_salary,
            "coverage_type": coverage_type,
            "base_premium": base_premium,
            "category_factor": cat_factor,
            "tenure_discount": tenure_discount_amount,
            "risk_adjustment": risk_adjustment_amount,
            "final_monthly_premium": final_premium,
            "max_monthly_benefit": max_monthly_benefit,
            "calculation_breakdown": breakdown,
            "recommendation_summary": recommendation,
            "is_prototype": True
        }
