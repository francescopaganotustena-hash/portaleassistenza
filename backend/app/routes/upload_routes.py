"""
Routes per upload file
"""
import os
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User
from app.middleware.auth import get_current_active_user
from app.config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])

# Crea directory uploads se non esiste
os.makedirs(settings.upload_dir, exist_ok=True)


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload singolo file"""
    # Valida estensione
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Estensione non consentita. Consentite: {', '.join(settings.allowed_extensions)}"
        )

    # Valida dimensione
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File troppo grande. Dimensione massima: {settings.max_file_size // 1024 // 1024}MB"
        )

    # Genera nome univoco
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, unique_filename)

    # Salva file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "filename": unique_filename,
        "original_filename": file.filename,
        "size": size,
        "content_type": file.content_type,
        "url": f"/api/upload/files/{unique_filename}"
    }


@router.get("/files/{filename}")
async def get_file(filename: str):
    """Download file"""
    file_path = os.path.join(settings.upload_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File non trovato")
    return FileResponse(file_path, filename=filename)


@router.delete("/files/{filename}")
async def delete_file(
    filename: str,
    current_user: User = Depends(get_current_active_user)
):
    """Elimina file"""
    file_path = os.path.join(settings.upload_dir, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": "File eliminato"}
    raise HTTPException(status_code=404, detail="File non trovato")
