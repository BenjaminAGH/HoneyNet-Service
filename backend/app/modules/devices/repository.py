from sqlalchemy.orm import Session
from .model import NetworkDevice

def clear_devices(db: Session):
    db.query(NetworkDevice).delete()
    db.commit()

def save_device(db: Session, device: NetworkDevice) -> NetworkDevice:
    db.add(device)
    db.commit()
    db.refresh(device)
    return device

def list_devices(db: Session) -> list[NetworkDevice]:
    return db.query(NetworkDevice).all()
