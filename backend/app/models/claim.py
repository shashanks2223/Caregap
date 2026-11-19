from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(100), unique=True, index=True, nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    claim_type = Column(String(50), nullable=False)  # OPTION_A (Illness/Injury), OPTION_B (Job Loss)
    
    # Claim Type A Fields
    incident_date = Column(String(20), nullable=True)
    incident_description = Column(Text, nullable=True)
    interruption_start_date = Column(String(20), nullable=True)
    expected_recovery_date = Column(String(20), nullable=True)
    
    # Claim Type B Fields
    termination_date = Column(String(20), nullable=True)
    termination_reason = Column(Text, nullable=True)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id", ondelete="SET NULL"), nullable=True)
    employer_name = Column(String(255), nullable=True)
    employer_contact = Column(String(100), nullable=True)
    last_working_date = Column(String(20), nullable=True)
    previous_monthly_salary = Column(Float, nullable=True)

    # Claim Type C / Placement Gap Fields (Signed up, no job for 15+ days)
    signup_date = Column(String(20), nullable=True)
    days_unassigned = Column(Integer, default=15)
    
    # Financial calculations
    claimed_salary = Column(Float, nullable=False, default=18000.0)
    calculated_benefit_amount = Column(Float, nullable=False, default=0.0)
    approved_benefit_amount = Column(Float, nullable=True)
    benefit_duration_days = Column(Integer, default=30)
    
    # Workflow Status
    # SUBMITTED -> DOCUMENT_VERIFICATION -> EMPLOYMENT_VERIFICATION -> UNDER_REVIEW -> APPROVED / REJECTED -> COMPLETED
    status = Column(String(50), default="SUBMITTED", index=True)
    
    # Notes & Remarks
    admin_notes = Column(Text, nullable=True)
    employer_notes = Column(Text, nullable=True)
    employer_verified = Column(Boolean, default=False)
    rejection_reason = Column(Text, nullable=True)
    
    # Fraud Detection & Quality Checks
    fraud_flag = Column(Boolean, default=False)
    fraud_reasons = Column(JSON, default=list)
    ai_summary = Column(Text, nullable=True)
    
    decision_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    policy = relationship("Policy", back_populates="claims")
    caregiver = relationship("CaregiverProfile", back_populates="claims")
    documents = relationship("ClaimDocument", back_populates="claim", cascade="all, delete-orphan")
    reviews = relationship("ClaimReview", back_populates="claim", cascade="all, delete-orphan")


class ClaimDocument(Base):
    __tablename__ = "claim_documents"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    
    document_type = Column(String(100), nullable=False)  # medical_certificate, termination_letter, salary_slip, etc.
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    mime_type = Column(String(100), nullable=False, default="application/pdf")
    
    # AI Document Extraction & Validation
    extracted_data = Column(JSON, default=dict)
    ai_validation_status = Column(String(50), default="pending")  # pending, valid, flagged, inconclusive
    ai_validation_notes = Column(Text, nullable=True)
    
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    claim = relationship("Claim", back_populates="documents")


class ClaimReview(Base):
    __tablename__ = "claim_reviews"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    review_type = Column(String(50), nullable=False)  # admin_review, employer_verification, ai_assistant_summary
    status = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)
    flags = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    claim = relationship("Claim", back_populates="reviews")
