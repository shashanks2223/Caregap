from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

class NotificationService:
    @staticmethod
    def send_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str = "system",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            is_read=False,
            metadata_json=metadata or {}
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

