"""
Modelli Database SQLAlchemy
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum
import os

Base = declarative_base()


class TicketStatus(enum.Enum):
    APERTURA = "apertura"
    IN_LAVORAZIONE = "in-lavorazione"
    RISOLTO = "risolto"
    CHIUSO = "chiuso"


class TicketPriority(enum.Enum):
    BASSA = "bassa"
    MEDIA = "media"
    ALTA = "alta"


class MessageType(enum.Enum):
    UTENTE = "utente"
    OPERATORE = "operatore"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    cognome = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    data_registrazione = Column(DateTime(timezone=True), server_default=func.now())
    ultimo_accesso = Column(DateTime(timezone=True), nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Relazioni
    tickets = relationship("Ticket", back_populates="user", foreign_keys="Ticket.user_id", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    categoria = Column(String(100), nullable=False)
    priorita = Column(SQLEnum(TicketPriority), nullable=False, default=TicketPriority.MEDIA)
    oggetto = Column(String(255), nullable=False)
    stato = Column(SQLEnum(TicketStatus), nullable=False, default=TicketStatus.APERTURA)
    descrizione = Column(Text, nullable=False)
    data_creazione = Column(DateTime(timezone=True), server_default=func.now())
    data_modifica = Column(DateTime(timezone=True), onupdate=func.now())
    data_chiusura = Column(DateTime(timezone=True), nullable=True)
    risolto_da = Column(Integer, ForeignKey("users.id"), nullable=True)
    allegati = Column(Text, nullable=True)  # JSON string con lista file

    # Relazioni
    user = relationship("User", back_populates="tickets", foreign_keys=[user_id])
    messages = relationship("Message", back_populates="ticket", cascade="all, delete-orphan")
    risolto_da_rel = relationship("User", foreign_keys=[risolto_da], backref="risolto_tickets")

    def __repr__(self):
        return f"<Ticket(id={self.id}, stato='{self.stato}', oggetto='{self.oggetto}')>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contenuto = Column(Text, nullable=False)
    tipo = Column(SQLEnum(MessageType), nullable=False, default=MessageType.UTENTE)
    data_invio = Column(DateTime(timezone=True), server_default=func.now())
    allegati = Column(Text, nullable=True)  # JSON string con lista file

    # Relazioni
    ticket = relationship("Ticket", back_populates="messages")
    user = relationship("User", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, ticket_id={self.ticket_id}, tipo='{self.tipo}')>"


# Crea cartella uploads se non esiste
os.makedirs("./uploads", exist_ok=True)
