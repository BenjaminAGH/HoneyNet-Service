from app.core.docker_client import client
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
import docker
import subprocess
import re
import os
from dotenv import load_dotenv

load_dotenv()
REAL_HOST_IP = os.getenv("DOCKER_HOST_IP")

from . import repository
from .dto import NetworkDTO, TopologyContainerDTO, TopologyDTO


class HoneypotService:
    def __init__(self, db: Session):
        self.db = db

    def extract_metadata(self, container) -> dict:
        raw_cmd = container.attrs["Config"].get("Cmd")
        if isinstance(raw_cmd, list):
            command = raw_cmd
        elif isinstance(raw_cmd, str):
            if raw_cmd.startswith("{") and raw_cmd.endswith("}"):
                tokens = re.findall(r'"[^"]+"|[^,{} ]+', raw_cmd)
                command = [t.strip('"') for t in tokens]
            else:
                command = raw_cmd.split()
        elif isinstance(raw_cmd, (bytes, bytearray)):
            command = raw_cmd.decode(errors="ignore").split()
        else:
            command = []

        created = datetime.fromisoformat(
            container.attrs["Created"].replace("Z", "+00:00")
        )

        return {
            "container_id": container.id,
            "name": container.name,
            "image": container.image.tags[0] if container.image.tags else "",
            "command": command,
            "created_at": created,
            "status": container.status,
            "ports": str(container.attrs["NetworkSettings"]["Ports"]),
            "source_type": "image",
            "path": None,
        }

    def create(self, data):
        if data.source_type == "image":
            if not data.image:
                raise HTTPException(status_code=422, detail="Se requiere 'image' para source_type='image'")
            try:
                container = client.containers.run(data.image, name=data.name, detach=True)
            except docker.errors.ImageNotFound:
                client.images.pull(data.image)
                container = client.containers.run(data.image, name=data.name, detach=True)
            except docker.errors.APIError as e:
                raise HTTPException(status_code=500, detail=f"Error al lanzar imagen '{data.image}': {e.explanation}")

        elif data.source_type == "dockerfile":
            if not data.path:
                raise HTTPException(status_code=422, detail="Se requiere 'path' para source_type='dockerfile'")
            
            if os.path.isdir(data.path):  # si es carpeta (modo 2)
                dockerfile_path = os.path.join(data.path, "Dockerfile")
                if not os.path.exists(dockerfile_path):
                    raise HTTPException(status_code=400, detail=f"No se encontró Dockerfile en {data.path}")
                image, _ = client.images.build(path=data.path, tag=data.name)
                container = client.containers.run(image.tags[0], name=data.name, detach=True)
            
            elif os.path.isfile(data.path):  # si es archivo suelto (modo 3)
                image, _ = client.images.build(fileobj=open(data.path, "rb"), tag=data.name, rm=True, custom_context=True)
                container = client.containers.run(image.tags[0], name=data.name, detach=True)
            
            else:
                raise HTTPException(status_code=400, detail=f"Ruta inválida para Dockerfile: {data.path}")


        elif data.source_type == "compose":
            if not data.path:
                raise HTTPException(status_code=422, detail="Se requiere 'path' para source_type='compose'")
            try:
                subprocess.run(["docker-compose", "-f", data.path, "up", "-d"], check=True)
            except subprocess.CalledProcessError as e:
                raise HTTPException(status_code=500, detail=f"Error al levantar con docker-compose: {e}")
            return repository.save_container(self.db, {
                "name": data.name,
                "source_type": data.source_type,
                "path": data.path,
                "status": "running"
            })

        else:
            raise HTTPException(status_code=400, detail=f"source_type inválido: {data.source_type}")

        metadata = self.extract_metadata(container)
        metadata["source_type"] = data.source_type
        metadata["path"] = data.path
        return repository.save_container(self.db, metadata)

    def list_active(self) -> list[dict]:
        containers = client.containers.list()
        return [self.extract_metadata(c) for c in containers]

    def list_all(self) -> list[dict]:
        models = repository.get_all_containers(self.db)
        results = []
        for m in models:
            raw_cmd = m.command or ""
            if raw_cmd.startswith("{") and raw_cmd.endswith("}"):
                tokens = re.findall(r'"[^"]+"|[^,{} ]+', raw_cmd)
                command = [t.strip('"') for t in tokens]
            else:
                command = raw_cmd.split() if raw_cmd else []
            results.append({
                "container_id": str(m.container_id),
                "name": m.name,
                "image": m.image,
                "command": command,
                "created_at": m.created_at,
                "status": m.status,
                "ports": m.ports,
                "source_type": m.source_type,
                "path": m.path,
            })
        return results

    def delete(self, name: str) -> dict:
        try:
            container = client.containers.get(name)
            container.stop()
            container.remove()
            return {"message": f"{name} eliminado"}
        except docker.errors.NotFound:
            raise HTTPException(status_code=404, detail=f"Contenedor '{name}' no encontrado")

    def get_topology(self) -> TopologyDTO:
        active = self.list_active()

        full_by_short = { c["container_id"][:12]: c["container_id"] for c in active }

        docker_nets = client.networks.list()
        network_dicts: list[dict] = []
        net_to_conts: dict[str, list[str]] = {}

        for summary in docker_nets:
            net = client.networks.get(summary.id)
            ipam_cfg = net.attrs.get("IPAM", {}).get("Config", [])
            subnet = ipam_cfg[0].get("Subnet") if ipam_cfg else None

            short_ids = list(net.attrs.get("Containers", {}).keys())
            attached = [full_by_short.get(s, s) for s in short_ids]

            network_dicts.append({
                "id": net.id,
                "name": net.name,
                "subnet": subnet,
                "containers": attached,
            })
            net_to_conts[net.id] = attached

        for c in active:
            c["source_type"] = c.get("source_type") or "image"
            c["path"] = c.get("path")
            c["networks"] = [
                net_id for net_id, conts in net_to_conts.items()
                if c["container_id"] in conts
            ]

            try:
                container = client.containers.get(c["name"])
                networks = container.attrs["NetworkSettings"]["Networks"]
                gateway = None
                for net_name, net_conf in networks.items():
                    if net_name != "none" and "Gateway" in net_conf:
                        gateway = net_conf["Gateway"]
                        break

                if gateway in ["172.20.0.1", "172.18.0.1", "172.17.0.1"]:
                    c["host_ip"] = REAL_HOST_IP
                else:
                    c["host_ip"] = gateway or ""
            except Exception:
                c["host_ip"] = ""

        return TopologyDTO(
            networks=[NetworkDTO(**n) for n in network_dicts],
            containers=[TopologyContainerDTO(**c) for c in active]
        )
