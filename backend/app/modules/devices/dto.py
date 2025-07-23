from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

class CreateDeviceDTO(BaseModel):
    name: str
    type: str
    ip: str
    network: str
    source_type: Literal["sniffer", "arp-scan", "manual"]
    ports: Optional[str] = None
    path: Optional[str] = None

class DeviceHistoryDTO(BaseModel):
    device_id: str
    name: str
    type: str
    ip: str
    ports: Optional[str]
    network: str
    created_at: datetime
    source_type: str
    path: Optional[str]

    class Config:
        from_attributes = True
