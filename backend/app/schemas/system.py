from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class IntegrationSettingResponse(BaseModel):
    id: int
    service_name: str
    is_enabled: bool
    is_demo_mode: bool
    status: str
    config_data: Dict[str, Any] = {}
    last_sync_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SyncLogResponse(BaseModel):
    id: int
    service_name: str
    sync_type: str
    records_synced: int
    status: str
    details: Dict[str, Any] = {}
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Dict[str, Any] = {}
    timestamp: datetime

    class Config:
        from_attributes = True

class VirtualLabExecuteRequest(BaseModel):
    lab_type: str  # "sql_query", "python_data_validation", "cpi_calculator"
    code_or_query: str
    parameters: Optional[Dict[str, Any]] = None

class VirtualLabExecuteResponse(BaseModel):
    lab_type: str
    success: bool
    output: Any
    execution_time_ms: float
    validation_feedback: str
    educational_notes: str
