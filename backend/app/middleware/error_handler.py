"""
Middleware per gestione errori e CORS
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings


def add_cors_middleware(app):
    """Aggiungi middleware CORS"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


async def global_exception_handler(request: Request, exc: Exception):
    """Gestione globale degli errori"""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    
    # Log dell'errore
    print(f"Errore non gestito: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Errore interno del server",
            "error": str(exc)
        },
    )
