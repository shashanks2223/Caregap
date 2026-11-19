from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.models.insurance import Policy, InsurancePlan
from app.models.claim import Claim

class EligibilityEngine:
    INELIGIBLE_TERMINATION_REASONS = [
        "voluntary resignation",
        "resigned",
        "abandoned duty",
        "disciplinary termination",
        "fraudulent behavior",
        "misconduct"
    ]

    QUALIFYING_TERMINATION_KEYWORDS = [
        "patient deceased",
        "patient recovery",
        "no longer required",
        "family relocated",
        "service contract ended",
        "agency downsizing",
        "family budget constraints",
        "involuntary termination"
    ]

    @staticmethod
    def evaluate_option_a_claim(
        policy: Policy,
        interruption_days: int,
        incident_date_str: str
    ) -> Dict[str, Any]:
        """
        Evaluate eligibility for Option A (Personal Illness / Injury Income Protection)
        """
        reasons_pass: List[str] = []
        reasons_fail: List[str] = []
        warnings: List[str] = []

        # 1. Active policy check
        if policy.status != "active":
            reasons_fail.append(f"Policy is not currently active (Current status: {policy.status}).")
        else:
            reasons_pass.append("Policy is in active good standing.")

        # 2. Waiting period check
        try:
            inc_dt = datetime.fromisoformat(incident_date_str.replace("Z", "+00:00"))
            if policy.waiting_period_ends_at and inc_dt < policy.waiting_period_ends_at:
                reasons_fail.append("Incident occurred during the 7-day initial policy waiting period.")
            else:
                reasons_pass.append("Initial waiting period successfully satisfied.")
        except Exception:
            warnings.append("Could not parse incident date for precise waiting period verification.")

        # 3. Maximum duration check
        max_days = policy.plan.max_option_a_duration_days if policy.plan else 60
        billable_days = min(interruption_days, max_days)
        if interruption_days > max_days:
            warnings.append(f"Claimed duration ({interruption_days} days) exceeds maximum allowable benefit duration ({max_days} days). Capped at {max_days} days.")

        # 4. Benefit calculation
        daily_benefit = round(policy.max_monthly_benefit / 30.0, 2)
        total_benefit = round(daily_benefit * billable_days, 2)

        is_eligible = len(reasons_fail) == 0

        return {
            "is_eligible": is_eligible,
            "claim_type": "OPTION_A",
            "billable_days": billable_days,
            "daily_benefit_rate": daily_benefit,
            "calculated_benefit": total_benefit,
            "passed_checks": reasons_pass,
            "failed_checks": reasons_fail,
            "warnings": warnings,
            "evaluation_notes": "Eligible for temporary medical incapacity income replacement under Option A." if is_eligible else "Does not meet standard simulated eligibility conditions."
        }

    @staticmethod
    def evaluate_option_b_claim(
        policy: Policy,
        termination_reason: str,
        tenure_months: int,
        termination_date_str: str
    ) -> Dict[str, Any]:
        """
        Evaluate eligibility for Option B (Employment Continuity / Involuntary Job Loss Protection)
        """
        reasons_pass: List[str] = []
        reasons_fail: List[str] = []
        warnings: List[str] = []

        # 1. Active policy check
        if policy.status != "active":
            reasons_fail.append(f"Policy is not active (Status: {policy.status}).")
        else:
            reasons_pass.append("Policy is active.")

        # 2. Waiting period check
        try:
            term_dt = datetime.fromisoformat(termination_date_str.replace("Z", "+00:00"))
            if policy.waiting_period_ends_at and term_dt < policy.waiting_period_ends_at:
                reasons_fail.append("Employment termination occurred during the initial waiting period.")
            else:
                reasons_pass.append("Policy waiting period satisfied.")
        except Exception:
            warnings.append("Could not parse termination date for waiting period check.")

        # 3. Minimum qualifying employment duration check (default 3 months)
        min_months = policy.plan.min_qualifying_employment_months if policy.plan else 3
        if tenure_months < min_months:
            reasons_fail.append(f"Caregiver employment tenure ({tenure_months} months) is below minimum requirement ({min_months} months).")
        else:
            reasons_pass.append(f"Employment tenure of {tenure_months} months meets requirement ({min_months}+ months).")

        # 4. Involuntary termination reason check
        normalized_reason = termination_reason.lower()
        if any(bad in normalized_reason for bad in EligibilityEngine.INELIGIBLE_TERMINATION_REASONS):
            reasons_fail.append(f"Exclusion triggered: Reason appears voluntary or disciplinary ('{termination_reason}').")
        else:
            reasons_pass.append("Termination reason classified as involuntary qualifying displacement.")

        # 5. Benefit calculation (1 month income replacement, max 60 days if extended)
        benefit_amount = round(policy.max_monthly_benefit, 2)
        is_eligible = len(reasons_fail) == 0

        return {
            "is_eligible": is_eligible,
            "claim_type": "OPTION_B",
            "calculated_benefit": benefit_amount if is_eligible else 0.0,
            "passed_checks": reasons_pass,
            "failed_checks": reasons_fail,
            "warnings": warnings,
            "evaluation_notes": "Qualifies for temporary income continuity support during transition." if is_eligible else "Involuntary employment loss criteria not met."
        }

    @staticmethod
    def evaluate_placement_gap_claim(
        policy: Policy,
        days_unassigned: int,
        signup_date_str: str,
        declared_salary: float
    ) -> Dict[str, Any]:
        """
        Evaluate eligibility for Placement Gap Protection (Signed up but not provided with a job for 15+ days).
        Caregivers without placement for 15 consecutive days receive 15 days of salary:
        15 days benefit = (Monthly Salary / 30) * 15 = Monthly Salary / 2.
        """
        reasons_pass: List[str] = []
        reasons_fail: List[str] = []
        warnings: List[str] = []

        # 1. Active policy check
        if policy.status != "active":
            reasons_fail.append(f"Policy is not active (Status: {policy.status}).")
        else:
            reasons_pass.append("Policy is in active good standing.")

        # 2. 15-Day Unassigned Bench Threshold Check
        if days_unassigned < 15:
            reasons_fail.append(f"Caregiver has been without placement for {days_unassigned} days; minimum requirement is 15 consecutive days.")
        else:
            reasons_pass.append(f"Verified {days_unassigned} days without job assignment (meets 15-day requirement).")

        # 3. 15-Day Salary Benefit Calculation
        daily_rate = round(declared_salary / 30.0, 2)
        total_benefit = round(daily_rate * 15.0, 2)

        is_eligible = len(reasons_fail) == 0

        return {
            "is_eligible": is_eligible,
            "claim_type": "PLACEMENT_GAP",
            "billable_days": 15,
            "daily_benefit_rate": daily_rate,
            "calculated_benefit": total_benefit if is_eligible else 0.0,
            "passed_checks": reasons_pass,
            "failed_checks": reasons_fail,
            "warnings": warnings,
            "evaluation_notes": "Eligible for 15 days salary compensation under Placement Gap Protection." if is_eligible else "Does not qualify for 15-day placement bench stipend."
        }
