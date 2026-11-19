from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    try:
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            ip_address=ip_address,
            details=details or {}
        )
        db.add(audit_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        # Non-blocking for primary transaction
        print(f"Failed to log audit event: {e}")
