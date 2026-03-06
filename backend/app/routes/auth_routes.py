"""
Controller per autenticazione
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password
)
from app.middleware.auth import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Autenticazione"])


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registra un nuovo utente"""
    # Verifica se email esiste già
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email già registrata"
        )
    
    # Crea nuovo utente
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        nome=user_data.nome,
        cognome=user_data.cognome,
        email=user_data.email,
        password_hash=hashed_password,
        telefono=user_data.telefono
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Autentica utente e restituisce token JWT"""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o password non corretti",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Genera token
    access_token_expires = timedelta(minutes=1440)  # 24 ore
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    # Aggiorna ultimo accesso
    user.ultimo_accesso = datetime.utcnow()
    db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout utente (invalida token lato client)"""
    return {"message": "Logout effettuato con successo"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Ottieni informazioni utente corrente"""
    return current_user
