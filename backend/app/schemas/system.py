from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    category: str
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime

class IntegrationSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_name: str
    is_enabled: bool
    is_demo_mode: bool
    status: str
    config_data: Dict[str, Any] = {}
    last_sync_at: Optional[datetime] = None

class SyncLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_name: str
    sync_type: str
    records_synced: int
    status: str
    details: Dict[str, Any] = {}
    started_at: datetime
    completed_at: Optional[datetime] = None

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Dict[str, Any] = {}
    timestamp: datetime
