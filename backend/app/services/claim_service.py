import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.claim import Claim, ClaimDocument, ClaimReview
from app.models.insurance import Policy
from app.models.profile import CaregiverProfile
from app.core.config import settings
from app.core.audit import log_audit
from app.services.notification_service import NotificationService
from app.services.gemini_service import gemini_service

class ClaimService:
    @staticmethod
    def generate_claim_number(db: Session) -> str:
        count = db.query(Claim).count() + 1
        year = datetime.now(timezone.utc).year
        return f"CG-CLM-{year}-{count:04d}"

    @staticmethod
    def generate_policy_number(db: Session) -> str:
        count = db.query(Policy).count() + 1
        year = datetime.now(timezone.utc).year
        return f"CG-POL-{year}-{count:04d}"

    @staticmethod
    def create_claim_a(
        db: Session,
        caregiver_profile: CaregiverProfile,
        policy: Policy,
        incident_date: str,
        incident_description: str,
        interruption_start_date: str,
        expected_recovery_date: str,
        claimed_salary: float
    ) -> Claim:
        claim_num = ClaimService.generate_claim_number(db)
        
        # Calculate illustrative duration days
        try:
            d1 = datetime.fromisoformat(interruption_start_date.replace("Z", "+00:00"))
            d2 = datetime.fromisoformat(expected_recovery_date.replace("Z", "+00:00"))
            duration_days = max(1, (d2 - d1).days)
        except Exception:
            duration_days = 30

        # Calculate potential benefit
        daily_rate = claimed_salary / 30.0
        calculated_benefit = round(daily_rate * min(duration_days, 60), 2)

        new_claim = Claim(
            claim_number=claim_num,
            policy_id=policy.id,
            caregiver_id=caregiver_profile.id,
            claim_type="OPTION_A",
            incident_date=incident_date,
            incident_description=incident_description,
            interruption_start_date=interruption_start_date,
            expected_recovery_date=expected_recovery_date,
            claimed_salary=claimed_salary,
            calculated_benefit_amount=calculated_benefit,
            benefit_duration_days=duration_days,
            status="SUBMITTED"
        )
        db.add(new_claim)
        db.commit()
        db.refresh(new_claim)

        # Notify Caregiver
        NotificationService.send_notification(
            db=db,
            user_id=caregiver_profile.user_id,
            title="Claim Submitted Successfully",
            message=f"Your Option A medical protection claim {claim_num} has been received and is undergoing automated document verification.",
            notification_type="claim",
            metadata={"claim_id": new_claim.id, "claim_number": claim_num}
        )

        log_audit(
            db=db,
            action="SUBMIT_CLAIM_A",
            entity_type="claim",
            entity_id=str(new_claim.id),
            user_id=caregiver_profile.user_id,
            details={"claim_number": claim_num, "amount": calculated_benefit}
        )

        return new_claim

    @staticmethod
    def create_claim_b(
        db: Session,
        caregiver_profile: CaregiverProfile,
        policy: Policy,
        termination_date: str,
        termination_reason: str,
        employer_name: Optional[str],
        employer_contact: Optional[str],
        last_working_date: str,
        previous_monthly_salary: float,
        claimed_salary: float
    ) -> Claim:
        claim_num = ClaimService.generate_claim_number(db)
        
        calculated_benefit = round(claimed_salary, 2)

        new_claim = Claim(
            claim_number=claim_num,
            policy_id=policy.id,
            caregiver_id=caregiver_profile.id,
            claim_type="OPTION_B",
            termination_date=termination_date,
            termination_reason=termination_reason,
            employer_name=employer_name or caregiver_profile.employer_name,
            employer_contact=employer_contact,
            last_working_date=last_working_date,
            previous_monthly_salary=previous_monthly_salary,
            claimed_salary=claimed_salary,
            calculated_benefit_amount=calculated_benefit,
            benefit_duration_days=30,
            status="EMPLOYMENT_VERIFICATION"  # Direct to employer check for Option B
        )
        db.add(new_claim)
        db.commit()
        db.refresh(new_claim)

        # Notify Caregiver
        NotificationService.send_notification(
            db=db,
            user_id=caregiver_profile.user_id,
            title="Employment Continuity Claim Filed",
            message=f"Your Option B continuity claim {claim_num} has been logged. Employment verification request sent to your agency/employer.",
            notification_type="claim",
            metadata={"claim_id": new_claim.id, "claim_number": claim_num}
        )

        log_audit(
            db=db,
            action="SUBMIT_CLAIM_B",
            entity_type="claim",
            entity_id=str(new_claim.id),
            user_id=caregiver_profile.user_id,
            details={"claim_number": claim_num, "amount": calculated_benefit}
        )

        return new_claim

