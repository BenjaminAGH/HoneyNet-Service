from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from datetime import datetime

class CreateHoneypotDTO(BaseModel):
    name: str
    source_type: Literal["image", "dockerfile", "compose"]
    image: Optional[str] = None
    path: Optional[str] = None

class HoneypotHistoryDTO(BaseModel):
    container_id: str
    name: str
    image: str
    command: List[str]
    created_at: datetime
    status: str
    ports: str
    source_type: str
    path: Optional[str]

    class Config:
        from_attributes = True

class NetworkDTO(BaseModel):
    id: str
    name: str
    subnet: Optional[str]
    containers: List[str]

class TopologyContainerDTO(HoneypotHistoryDTO):
    networks: List[str] = Field(
        default_factory=list,
        description="Lista de IDs de red"
    )

class TopologyDTO(BaseModel):
    networks: List[NetworkDTO]
    containers: List[TopologyContainerDTO]
