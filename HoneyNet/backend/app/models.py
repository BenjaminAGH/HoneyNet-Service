from pydantic import BaseModel, Field, validator
import ipaddress

class HoneypotRequest(BaseModel):
    ip: str = Field(..., description="Valid IPv4 address")
    protocol: str = Field(..., min_length=2, max_length=20, description="Protocol name (2 to 20 characters)")
    port: int = Field(..., ge=1, le=65535, description="Valid TCP port (1–65535)")
    image: str = Field(default=None, description="Optional Docker image name")

    @validator("ip")
    def validate_ip(cls, v):
        try:
            ipaddress.IPv4Address(v)
        except ValueError:
            raise ValueError("Must be a valid IPv4 address")
        return v