"""
Main application FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.config import settings
from app.database import engine, Base
from app.middleware.error_handler import add_cors_middleware, global_exception_handler
from app.routes import auth_routes, user_routes, ticket_routes, message_routes, admin_routes, upload_routes

# Crea tabella database
Base.metadata.create_all(bind=engine)

# Crea applicazione FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API per Portale Assistenza Studio81 SRL",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Aggiungi CORS middleware
add_cors_middleware(app)

# Registra exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Registra routes
app.include_router(auth_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/api")
app.include_router(ticket_routes.router, prefix="/api")
app.include_router(message_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(upload_routes.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Benvenuto nell'API Portale Assistenza Studio81",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
