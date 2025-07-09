from sqlalchemy.orm import Session
from .model import HoneypotContainer

def save_container(db: Session, container_data: dict):
    container = HoneypotContainer(**container_data)
    db.add(container)
    db.commit()
    db.refresh(container)
    return container

def get_all_containers(db: Session):
    return db.query(HoneypotContainer).all()
