import time
from sqlalchemy.exc import OperationalError
from app.core.database import engine, Base
from app.modules.honeypot.model import HoneypotContainer

def init_db(retries: int = 10, delay: int = 3):
    for attempt in range(retries):
        try:
            print(f"[init_db] Intentando conectar a la base de datos (intento {attempt + 1})...")
            Base.metadata.create_all(bind=engine)
            print("[init_db] Tablas creadas exitosamente.")
            return
        except OperationalError as e:
            print(f"[init_db] Falló la conexión: {e}")
            time.sleep(delay)
    print("[init_db] No se pudo conectar a la base de datos después de varios intentos.")
    raise Exception("Fallo crítico: no se pudo inicializar la base de datos.")
