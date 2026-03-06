"""
Servizi per la gestione dei messaggi
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Message, MessageType, Ticket


class MessageService:
    """Servizio per la gestione dei messaggi"""
    
    @staticmethod
    def create_message(db: Session, ticket_id: int, user_id: int, 
                      contenuto: str, tipo: str, allegati: Optional[str] = None) -> Message:
        """Crea un nuovo messaggio in un ticket"""
        message = Message(
            ticket_id=ticket_id,
            user_id=user_id,
            contenuto=contenuto,
            tipo=MessageType(tipo),
            allegati=allegati
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    
    @staticmethod
    def get_messages_by_ticket(db: Session, ticket_id: int) -> List[Message]:
        """Ottieni tutti i messaggi di un ticket"""
        return db.query(Message).filter(
            Message.ticket_id == ticket_id
        ).order_by(desc(Message.data_invio)).all()
    
    @staticmethod
    def add_response(db: Session, ticket_id: int, user_id: int, 
                    risposta: str) -> Optional[Message]:
        """Aggiunge una risposta a un ticket"""
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            return None
        
        # Se il ticket è chiuso, lo riapriamo
        if ticket.stato.value == "chiuso":
            ticket.stato = MessageType.UTENTE
            ticket.data_modifica = datetime.utcnow()
        
        return MessageService.create_message(
            db=db,
            ticket_id=ticket_id,
            user_id=user_id,
            contenuto=risposta,
            tipo=MessageType.UTENTE.value
        )
