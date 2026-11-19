from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    action = Column(String(100), nullable=False)  # CREATE_POLICY, SUBMIT_CLAIM, APPROVE_CLAIM, etc.
    entity_type = Column(String(50), nullable=False)  # user, policy, claim, plan
    entity_id = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="audit_logs")
