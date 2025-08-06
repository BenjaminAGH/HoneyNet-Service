from fastapi import FastAPI
from app.modules.honeypot.controller import router as honeypot_router
from app.modules.devices.controller import router as device_router

from app.core.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings  # Importa bien

app = FastAPI()

init_db()

app.include_router(honeypot_router)
app.include_router(device_router)

print("CORS frontend_url:", settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
