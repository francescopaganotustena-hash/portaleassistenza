"""
Servizi per la gestione dei ticket
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Ticket, TicketStatus, TicketPriority, Message, User


class TicketService:
    """Servizio per la gestione dei ticket"""
    
    @staticmethod
    def create_ticket(db: Session, user_id: int, categoria: str, priorita: str,
                     oggetto: str, descrizione: str, allegati: Optional[str] = None) -> Ticket:
        """Crea un nuovo ticket"""
        ticket = Ticket(
            user_id=user_id,
            categoria=categoria,
            priorita=TicketPriority(priorita),
            oggetto=oggetto,
            descrizione=descrizione,
            allegati=allegati
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        return ticket
    
    @staticmethod
    def get_ticket(db: Session, ticket_id: int, user_id: int) -> Optional[Ticket]:
        """Ottieni un ticket specifico (solo se appartiene all'utente o è admin)"""
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if ticket and (ticket.user_id == user_id or TicketService._is_admin(db, user_id)):
            return ticket
        return None
    
    @staticmethod
    def get_tickets_by_user(db: Session, user_id: int, 
                           filters: Optional[Dict[str, Any]] = None) -> List[Ticket]:
        """Ottieni tutti i ticket di un utente con filtri opzionali"""
        query = db.query(Ticket).filter(Ticket.user_id == user_id)
        
        if filters:
            if "stato" in filters and filters["stato"]:
                query = query.filter(Ticket.stato == TicketStatus(filters["stato"]))
            if "categoria" in filters and filters["categoria"]:
                query = query.filter(Ticket.categoria == filters["categoria"])
            if "priorita" in filters and filters["priorita"]:
                query = query.filter(Ticket.priorita == TicketPriority(filters["priorita"]))
        
        return query.order_by(desc(Ticket.data_creazione)).all()
    
    @staticmethod
    def update_ticket(db: Session, ticket_id: int, user_id: int, 
                     **kwargs) -> Optional[Ticket]:
        """Aggiorna un ticket"""
        ticket = TicketService.get_ticket(db, ticket_id, user_id)
        if not ticket:
            return None
        
        for key, value in kwargs.items():
            if hasattr(ticket, key):
                setattr(ticket, key, value)
        
        db.commit()
        db.refresh(ticket)
        return ticket
    
    @staticmethod
    def update_status(db: Session, ticket_id: int, user_id: int, 
                     nuovo_stato: str, operatore_id: Optional[int] = None) -> Optional[Ticket]:
        """Aggiorna lo stato di un ticket"""
        ticket = TicketService.get_ticket(db, ticket_id, user_id)
        if not ticket:
            return None
        
        ticket.stato = TicketStatus(nuovo_stato)
        if nuovo_stato == TicketStatus.RISOLTO.value:
            ticket.data_chiusura = datetime.utcnow()
            if operatore_id:
                ticket.risolto_da = operatore_id
        
        db.commit()
        db.refresh(ticket)
        return ticket
    
    @staticmethod
    def get_stats(db: Session, user_id: int) -> Dict[str, int]:
        """Ottieni statistiche dei ticket per un utente"""
        tickets = db.query(Ticket).filter(Ticket.user_id == user_id).all()
        
        return {
            "totali": len(tickets),
            "aperti": len([t for t in tickets if t.stato == TicketStatus.APERTURA]),
            "in_lavorazione": len([t for t in tickets if t.stato == TicketStatus.IN_LAVORAZIONE]),
            "risolti": len([t for t in tickets if t.stato == TicketStatus.RISOLTO])
        }
    
    @staticmethod
    def _is_admin(db: Session, user_id: int) -> bool:
        """Verifica se un utente è admin"""
        user = db.query(User).filter(User.id == user_id).first()
        return user and user.is_admin
