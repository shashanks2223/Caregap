from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    metadata_json: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationMarkRead(BaseModel):
    notification_id: int
