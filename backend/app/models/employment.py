from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class EmploymentRecord(Base):
    __tablename__ = "employment_records"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    employer_id = Column(Integer, ForeignKey("employer_profiles.id", ondelete="SET NULL"), nullable=True)
    
    employer_name = Column(String(255), nullable=False)
    role_title = Column(String(100), nullable=False, default="Senior Caregiver")
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=True)
    is_current = Column(Boolean, default=True)
    
    status = Column(String(50), default="active")  # active, pending_verification, terminated, disputed
    termination_date = Column(String(20), nullable=True)
    termination_reason = Column(Text, nullable=True)
    employer_verified = Column(Boolean, default=False)
    verification_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    caregiver = relationship("CaregiverProfile", back_populates="employment_records")
    employer = relationship("EmployerProfile", back_populates="employment_records")
    salary_records = relationship("SalaryRecord", back_populates="employment_record", cascade="all, delete-orphan")


class SalaryRecord(Base):
    __tablename__ = "salary_records"

    id = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"), nullable=False)
    employment_record_id = Column(Integer, ForeignKey("employment_records.id", ondelete="CASCADE"), nullable=True)
    
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    declared_salary = Column(Float, nullable=False)
    verified_salary = Column(Float, nullable=True)
    salary_slip_url = Column(String(255), nullable=True)
    
    is_verified = Column(Boolean, default=False)
    verified_by_employer_id = Column(Integer, ForeignKey("employer_profiles.id", ondelete="SET NULL"), nullable=True)
    verification_date = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    caregiver = relationship("CaregiverProfile", back_populates="salary_records")
    employment_record = relationship("EmploymentRecord", back_populates="salary_records")
