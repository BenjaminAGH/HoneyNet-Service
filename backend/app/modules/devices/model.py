import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class NetworkDevice(Base):
    __tablename__ = "network_devices"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    device_id   = Column(String, nullable=False, unique=True)
    name        = Column(String, nullable=False)
    type        = Column(String, nullable=False)
    ip          = Column(String, nullable=False)
    ports       = Column(String, nullable=True)
    network     = Column(String, nullable=False)
    created_at  = Column(DateTime, nullable=False)
    source_type = Column(String, nullable=False)
    path        = Column(String, nullable=True)
