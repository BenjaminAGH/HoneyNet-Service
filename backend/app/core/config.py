from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    frontend_url: str = "http://localhost:3000"  # ← agregado aquí

    class Config:
        env_file = ".env"

settings = Settings()
