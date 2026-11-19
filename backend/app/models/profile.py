from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    full_name = Column(String(255), nullable=False)
    mobile_number = Column(String(20), nullable=False)
    date_of_birth = Column(String(20), nullable=True)  # YYYY-MM-DD
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pin_code = Column(String(10), nullable=False)
    
    # Caregiving & Employment Information
    caregiver_category = Column(String(100), nullable=False, default="Elderly Care") 
    years_experience = Column(Float, nullable=False, default=1.0)
    monthly_salary = Column(Float, nullable=False, default=18000.0)
    employment_type = Column(String(100), nullable=False, default="Full-Time Agency")
    employer_name = Column(String(255), nullable=True)
    employment_start_date = Column(String(20), nullable=True)
    
    # Bank Account Verification Status (Never store actual credentials, only status & masked view)
    bank_verification_status = Column(String(50), default="pending")  # pending, verified, rejected
    bank_name = Column(String(100), nullable=True)
    bank_account_last4 = Column(String(4), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    
    verification_documents = Column(JSON, default=list)  # list of uploaded metadata
    profile_photo_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="caregiver_profile")
    employment_records = relationship("EmploymentRecord", back_populates="caregiver", cascade="all, delete-orphan")
    salary_records = relationship("SalaryRecord", back_populates="caregiver", cascade="all, delete-orphan")
    policies = relationship("Policy", back_populates="caregiver", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="caregiver", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="caregiver", cascade="all, delete-orphan")
    premium_calculations = relationship("PremiumCalculation", back_populates="caregiver", cascade="all, delete-orphan")


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    organization_name = Column(String(255), nullable=False)
    organization_type = Column(String(100), nullable=False, default="Care Agency")  # Care Agency, Hospital/Clinic, Private Household
    contact_person = Column(String(255), nullable=False)
    mobile_number = Column(String(20), nullable=False)
    registration_number = Column(String(100), nullable=True)
    
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pin_code = Column(String(10), nullable=False)
    
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="employer_profile")
    employment_records = relationship("EmploymentRecord", back_populates="employer")
