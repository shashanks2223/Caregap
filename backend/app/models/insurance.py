from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    id = Column(Integer, primary_key=True, index=True)
    plan_code = Column(String(50), unique=True, index=True, nullable=False)  # BASIC, PLUS, PREMIUM
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    coverage_option = Column(String(50), nullable=False)  # OPTION_A, COMBINED, COMBINED_PREMIUM
    
    # Illustrative pricing parameters (never hardcoded, configurable by Admin)
    monthly_premium = Column(Float, nullable=False, default=199.0)
    base_option_a_premium = Column(Float, nullable=False, default=199.0)
    option_b_premium = Column(Float, nullable=False, default=150.0)
    additional_benefits_premium = Column(Float, nullable=False, default=150.0)
    
    # Coverage constraints & conditions
    max_option_a_duration_days = Column(Integer, default=60)
    max_option_b_duration_days = Column(Integer, default=60)
    option_a_waiting_period_days = Column(Integer, default=7)
    option_b_waiting_period_days = Column(Integer, default=14)
    min_qualifying_employment_months = Column(Integer, default=3)
    coverage_limit_multiplier = Column(Float, default=1.0)  # Up to 100% of salary
    
    exclusions = Column(JSON, default=list)
    eligibility_conditions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    policies = relationship("Policy", back_populates="plan")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(100), unique=True, index=True, nullable=False)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(Integer, ForeignKey("insurance_plans.id"), nullable=False)
    
    coverage_type = Column(String(50), nullable=False)  # OPTION_A, OPTION_B, COMBINED
    status = Column(String(50), default="active")  # active, grace_period, lapsed, cancelled
    
    start_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    renewal_date = Column(DateTime, nullable=False)
    waiting_period_ends_at = Column(DateTime, nullable=False)
    
    monthly_premium = Column(Float, nullable=False)
    max_monthly_benefit = Column(Float, nullable=False)
    declared_monthly_salary = Column(Float, nullable=False)
    
    terms_accepted = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    caregiver = relationship("CaregiverProfile", back_populates="policies")
    plan = relationship("InsurancePlan", back_populates="policies")
    coverages = relationship("PolicyCoverage", back_populates="policy", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="policy")
    risk_assessments = relationship("RiskAssessment", back_populates="policy")


class PolicyCoverage(Base):
    __tablename__ = "policy_coverages"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    
    coverage_type = Column(String(50), nullable=False)  # OPTION_A, OPTION_B, ADDITIONAL_PERKS
    benefit_percentage = Column(Float, default=100.0)  # e.g. 80-100% of income
    max_duration_days = Column(Integer, default=60)
    current_utilized_days = Column(Integer, default=0)
    coverage_amount = Column(Float, nullable=False)
    terms = Column(JSON, default=dict)

    # Relationships
    policy = relationship("Policy", back_populates="coverages")


class PremiumCalculation(Base):
    __tablename__ = "premium_calculations"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    
    calculated_for_salary = Column(Float, nullable=False)
    selected_plan_id = Column(Integer, nullable=True)
    selected_coverage = Column(String(50), nullable=False)
    
    base_rate = Column(Float, nullable=False)
    category_factor = Column(Float, default=1.0)
    tenure_discount = Column(Float, default=0.0)
    risk_adjustment = Column(Float, default=0.0)
    final_calculated_premium = Column(Float, nullable=False)
    
    calculation_breakdown = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    caregiver = relationship("CaregiverProfile", back_populates="premium_calculations")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="SET NULL"), nullable=True)
    
    risk_category = Column(String(50), default="LOW")  # LOW, MODERATE, HIGH
    risk_score = Column(Integer, default=25)  # 0 to 100
    risk_factors = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    explanation = Column(Text, nullable=False)
    
    assessed_by_ai = Column(Boolean, default=True)
    human_reviewed = Column(Boolean, default=False)
    human_reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    caregiver = relationship("CaregiverProfile", back_populates="risk_assessments")
    policy = relationship("Policy", back_populates="risk_assessments")
