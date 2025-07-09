from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from .service import HoneypotService
from .dto import CreateHoneypotDTO, HoneypotHistoryDTO, TopologyDTO
from typing import List

router = APIRouter(prefix="/honeypots", tags=["Honeypots"])

@router.post("/")
def create_container(data: CreateHoneypotDTO, db: Session = Depends(get_db)):
    service = HoneypotService(db)
    try:
        return service.create(data)
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active")
def list_active_containers(db: Session = Depends(get_db)):
    return HoneypotService(db).list_active()

@router.get("/history", response_model=List[HoneypotHistoryDTO])
def list_all_containers(db: Session = Depends(get_db)):
    return HoneypotService(db).list_all()

@router.delete("/{name}")
def delete_container(name: str, db: Session = Depends(get_db)):
    return HoneypotService(db).delete(name)

@router.get("/topology", response_model=TopologyDTO)
def get_topology(db: Session = Depends(get_db)):
    return HoneypotService(db).get_topology()