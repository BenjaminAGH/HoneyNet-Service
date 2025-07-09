import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID

class HoneypotContainer(Base):
    __tablename__ = "honeypots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    container_id = Column(String)
    name = Column(String)
    image = Column(String)
    command = Column(Text)
    status = Column(String)
    ports = Column(String)
    created_at = Column(DateTime)
    source_type = Column(String)
    path = Column(String, nullable=True)
