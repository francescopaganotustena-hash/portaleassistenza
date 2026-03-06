"""
Modelli Pydantic per validazione input/output API
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models import TicketStatus, TicketPriority, MessageType


# === User Models ===

class UserBase(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    cognome: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    telefono: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    data_registrazione: datetime
    ultimo_accesso: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    cognome: Optional[str] = Field(None, min_length=1, max_length=100)
    telefono: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


# === Auth Models ===

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# === Ticket Models ===

class TicketBase(BaseModel):
    categoria: str = Field(..., min_length=1, max_length=100)
    priorita: str = Field(..., pattern="^(bassa|media|alta)$")
    oggetto: str = Field(..., min_length=1, max_length=255)
    descrizione: str = Field(..., min_length=10)


class TicketCreate(TicketBase):
    allegato: Optional[str] = None


class TicketResponse(TicketBase):
    id: int
    stato: str
    user_id: int
    data_creazione: datetime
    data_modifica: Optional[datetime] = None
    data_chiusura: Optional[datetime] = None
    allegati: Optional[str] = None
    
    class Config:
        from_attributes = True


class TicketUpdate(BaseModel):
    categoria: Optional[str] = None
    priorita: Optional[str] = None
    oggetto: Optional[str] = None
    descrizione: Optional[str] = None
    stato: Optional[str] = None


class TicketStats(BaseModel):
    totali: int
    aperti: int
    in_lavorazione: int
    risolti: int


# === Message Models ===

class MessageBase(BaseModel):
    contenuto: str = Field(..., min_length=1)


class MessageCreate(MessageBase):
    tipo: str = Field(..., pattern="^(utente|operatore)$")
    allegati: Optional[str] = None


class MessageResponse(MessageBase):
    id: int
    ticket_id: int
    user_id: int
    tipo: str
    data_invio: datetime
    allegati: Optional[str] = None
    
    class Config:
        from_attributes = True


# === Filter Models ===

class TicketFilter(BaseModel):
    stato: Optional[str] = None
    categoria: Optional[str] = None
    priorita: Optional[str] = None
    ricerca: Optional[str] = None


# === Error Models ===

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


class ValidationErrorResponse(BaseModel):
    detail: List[dict]
