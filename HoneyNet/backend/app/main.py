from fastapi import FastAPI
from app.docker_control import launch_isolated_honeypot, list_honeypots, remove_honeypot
from app.models import HoneypotRequest
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


@app.post("/honeypot/")
def launch(req: HoneypotRequest):
    return launch_isolated_honeypot(req.ip, req.protocol, req.port, req.image)


@app.get("/honeypots/")
def list_all():
    return list_honeypots()


@app.delete("/honeypot/")
def remove(ip: str, protocol: str):
    return remove_honeypot(ip, protocol)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)