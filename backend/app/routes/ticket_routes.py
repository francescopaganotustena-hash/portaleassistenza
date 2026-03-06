"""
Controller per gestione ticket
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models import User, Ticket, TicketStatus
from app.schemas import TicketCreate, TicketResponse, TicketUpdate, TicketStats, TicketFilter
from app.services.ticket_service import TicketService
from app.middleware.auth import get_current_active_user

router = APIRouter(prefix="/tickets", tags=["Ticket"])


@router.post("", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea un nuovo ticket"""
    ticket = TicketService.create_ticket(
        db=db,
        user_id=current_user.id,
        categoria=ticket_data.categoria,
        priorita=ticket_data.priorita,
        oggetto=ticket_data.oggetto,
        descrizione=ticket_data.descrizione,
        allegati=ticket_data.allegato
    )
    return ticket


@router.get("", response_model=List[TicketResponse])
async def list_my_tickets(
    filters: Optional[TicketFilter] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista ticket dell'utente corrente con filtri"""
    tickets = TicketService.get_tickets_by_user(
        db=db,
        user_id=current_user.id,
        filters=filters.dict() if filters else None
    )
    return tickets[skip:skip + limit]


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Ottieni dettaglio ticket"""
    ticket = TicketService.get_ticket(db, ticket_id, current_user.id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aggiorna ticket"""
    update_data = ticket_data.dict(exclude_unset=True)
    ticket = TicketService.update_ticket(db, ticket_id, current_user.id, **update_data)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    return ticket


@router.post("/{ticket_id}/status", response_model=TicketResponse)
async def update_ticket_status(
    ticket_id: int,
    nuovo_stato: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aggiorna stato ticket"""
    ticket = TicketService.update_status(
        db, ticket_id, current_user.id, nuovo_stato
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    return ticket


@router.get("/{ticket_id}/stats", response_model=TicketStats)
async def get_ticket_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Ottieni statistiche ticket utente"""
    stats = TicketService.get_stats(db, current_user.id)
    return stats


@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina ticket (solo se è proprietario)"""
    ticket = TicketService.get_ticket(db, ticket_id, current_user.id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket non trovato"
        )
    
    db.delete(ticket)
    db.commit()
    return {"message": "Ticket eliminato con successo"}
