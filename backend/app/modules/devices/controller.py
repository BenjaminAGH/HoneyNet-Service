from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from .dto import CreateDeviceDTO, DeviceHistoryDTO
from .service import DeviceService
from app.core.config import settings

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.post("/discover", response_model=List[DeviceHistoryDTO])
def discover_devices(subnet: str = settings.red_ip, db: Session = Depends(get_db)):
    """
    Escanea la subred indicada vía ARP y guarda/lista todos los dispositivos encontrados.
    """
    try:
        return DeviceService(db).discover(subnet)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=DeviceHistoryDTO)
def create_device(data: CreateDeviceDTO, db: Session = Depends(get_db)):
    try:
        return DeviceService(db).create(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[DeviceHistoryDTO])
def list_devices(db: Session = Depends(get_db)):
    return DeviceService(db).list_all()
