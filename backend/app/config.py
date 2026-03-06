"""
Configurazione applicazione FastAPI
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    app_name: str = "Portale Assistenza Studio81"
    app_version: str = "1.0.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite:///./database.db"

    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    refresh_token_expire_days: int = 7

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    mail_from_addr: str = ""
    mail_from_name: str = "Portale Assistenza"

    # Upload
    max_file_size: int = 10485760  # 10MB
    upload_dir: str = "./uploads"
    allowed_extensions: List[str] = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"]

    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://10.0.0.103:8080",
        "http://127.0.0.1:8080"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
