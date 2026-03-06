"""
Controller per dashboard admin
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Ticket, TicketStatus
from app.schemas import UserResponse, TicketResponse, TicketStats
from app.middleware.auth import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Ottieni statistiche generali dashboard admin"""
    # Totali utenti
    total_users = db.query(func.count(User.id)).scalar()
    
    # Totali ticket
    total_tickets = db.query(func.count(Ticket.id)).scalar()
    
    # Ticket per stato
    aperti = db.query(func.count(Ticket.id)).filter(
        Ticket.stato == TicketStatus.APERTURA
    ).scalar()
    
    in_lavorazione = db.query(func.count(Ticket.id)).filter(
        Ticket.stato == TicketStatus.IN_LAVORAZIONE
    ).scalar()
    
    risolti = db.query(func.count(Ticket.id)).filter(
        Ticket.stato == TicketStatus.RISOLTO
    ).scalar()
    
    # Ticket creati negli ultimi 7 giorni
    sette_giorni_fa = datetime.utcnow() - timedelta(days=7)
    nuovi_ultimi_7_giorni = db.query(func.count(Ticket.id)).filter(
        Ticket.data_creazione >= sette_giorni_fa
    ).scalar()
    
    return {
        "total_users": total_users,
        "total_tickets": total_tickets,
        "aperti": aperti,
        "in_lavorazione": in_lavorazione,
        "risolti": risolti,
        "nuovi_ultimi_7_giorni": nuovi_ultimi_7_giorni
    }


@router.get("/tickets", response_model=List[TicketResponse])
async def list_all_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    stato: str = Query(None),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Lista tutti i ticket (admin)"""
    query = db.query(Ticket)
    
    if stato:
        query = query.filter(Ticket.stato == TicketStatus(stato))
    
    tickets = query.order_by(desc(Ticket.data_creazione)).offset(skip).limit(limit).all()
    return tickets


@router.get("/tickets/{ticket_id}/details")
async def get_ticket_details(
    ticket_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Ottieni dettagli completi ticket (admin)"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    
    # Ottieni utente proprietario
    user = db.query(User).filter(User.id == ticket.user_id).first()
    
    # Ottieni tutti i messaggi
    from app.services.message_service import MessageService
    messages = MessageService.get_messages_by_ticket(db, ticket_id)
    
    return {
        "ticket": ticket,
        "user": user,
        "messages": messages
    }


@router.put("/tickets/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: int,
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Assegna ticket a un utente (admin)"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    
    # Verifica che l'utente esista
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )
    
    ticket.user_id = user_id
    ticket.stato = TicketStatus.IN_LAVORAZIONE
    ticket.data_modifica = db.func.now()
    
    db.commit()
    db.refresh(ticket)
    
    return ticket


@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Attiva/Disattiva utente (admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return {"message": f"Utente {'attivato' if user.is_active else 'disattivato'} con successo"}
