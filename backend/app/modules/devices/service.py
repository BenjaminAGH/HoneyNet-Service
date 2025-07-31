from sqlalchemy.orm import Session
from datetime import datetime, timezone
from scapy.all import ARP, Ether, srp
from .model import NetworkDevice
from .repository import clear_devices, save_device, list_devices
from .dto import CreateDeviceDTO, DeviceHistoryDTO
from app.core.config import settings


import nmap

class DeviceService:
    def __init__(self, db: Session):
        self.db = db

    def scan_with_nmap(self, ip: str):
        scanner = nmap.PortScanner()
        try:
            scanner.scan(ip, arguments='-O --host-timeout 10s')
            os = scanner[ip].get('osmatch', [{}])[0].get('name', 'unknown')
            ports = []
            for proto in scanner[ip].all_protocols():
                lport = scanner[ip][proto].keys()
                for port in sorted(lport):
                    ports.append(str(port))
            return os, ','.join(ports)
        except Exception:
            return 'unknown', ''

    def discover(self, subnet: str = settings.red_ip) -> list[DeviceHistoryDTO]:
        # 1) Limpia la tabla
        clear_devices(self.db)

        # 2) ARP scan
        packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=subnet)
        answered, _ = srp(packet, timeout=2, verbose=False)

        devices = []
        now = datetime.now(timezone.utc)
        for snd, rcv in answered:
            ip = rcv.psrc
            os_type, open_ports = self.scan_with_nmap(ip)

            # Marcar como router si la IP termina en .0.1 o .1
            if ip.endswith(".0.1") or ip.endswith(".1"):
                os_type = "router"

            d = NetworkDevice(
                device_id   = f"{ip}-{now.timestamp()}",
                name        = ip,
                type        = os_type,
                ip          = ip,
                ports       = open_ports,
                network     = subnet,
                created_at  = now,
                source_type = "arp-scan",
                path        = None,
            )
            saved = save_device(self.db, d)
            devices.append(DeviceHistoryDTO.from_orm(saved))

        return devices

    def list_all(self) -> list[DeviceHistoryDTO]:
        return [DeviceHistoryDTO.from_orm(d) for d in list_devices(self.db)]
