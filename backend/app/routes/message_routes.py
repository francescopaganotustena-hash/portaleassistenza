"""
Controller per gestione messaggi
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Message
from app.schemas import MessageCreate, MessageResponse
from app.services.message_service import MessageService
from app.services.ticket_service import TicketService
from app.middleware.auth import get_current_active_user

router = APIRouter(prefix="/messages", tags=["Messaggi"])


@router.post("/{ticket_id}/messages", response_model=MessageResponse)
async def add_message(
    ticket_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aggiungi messaggio a un ticket"""
    # Verifica che il ticket esista e l'utente ne sia proprietario
    ticket = TicketService.get_ticket(db, ticket_id, current_user.id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    
    message = MessageService.create_message(
        db=db,
        ticket_id=ticket_id,
        user_id=current_user.id,
        contenuto=message_data.contenuto,
        tipo=message_data.tipo
    )
    
    # Aggiorna data modifica ticket
    ticket.data_modifica = db.func.now()
    db.commit()
    
    return message


@router.get("/{ticket_id}/messages", response_model=List[MessageResponse])
async def get_ticket_messages(
    ticket_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Ottieni tutti i messaggi di un ticket"""
    # Verifica accesso al ticket
    ticket = TicketService.get_ticket(db, ticket_id, current_user.id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    
    messages = MessageService.get_messages_by_ticket(db, ticket_id)
    return messages
