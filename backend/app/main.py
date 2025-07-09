from fastapi import FastAPI
from app.modules.honeypot.controller import router as honeypot_router
from app.core.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.core.cors import add_cors

app = FastAPI()

init_db() 

app.include_router(honeypot_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_cors(app)