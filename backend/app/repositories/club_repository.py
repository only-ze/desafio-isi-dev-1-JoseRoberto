from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models import Clube

def exists(db: Session, club_id: int) -> bool:
    return db.scalar(select(Clube.id).where(Clube.id == club_id)) is not None

def get(db: Session, club_id: int) -> Clube | None:
    return db.get(Clube, club_id)

def list_all(db: Session) -> list[Clube]:
    return list(db.scalars(select(Clube)))

def count(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(Clube)) or 0

def name_exists(db: Session, name: str) -> bool:
    return db.scalar(select(Clube.id).where(func.lower(Clube.nome) == name.lower())) is not None

def acronym_exists(db: Session, acronym: str) -> bool:
    return db.scalar(select(Clube.id).where(Clube.sigla == acronym)) is not None

def add(db: Session, club: Clube) -> Clube:
    db.add(club)
    db.flush()
    return club