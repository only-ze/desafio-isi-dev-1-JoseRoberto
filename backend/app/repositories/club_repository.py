from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Clube

def exists(db: Session, club_id: int) -> bool:
    return db.scalar(select(Clube.id).where(Clube.id == club_id)) is not None