from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Contrato

def active_by_club(db: Session, club_id: int) -> dict[int, Contrato]:
    stmt = select(Contrato).where(Contrato.clube_id == club_id, Contrato.situacao == "ATIVO")
    return {contract.jogador_id: contract for contract in db.scalars(stmt)}

def add(db: Session, contract: Contrato) -> Contrato:
    db.add(contract)
    return contract

def active_of_player(db: Session, player_id: int) -> Contrato | None:
    stmt = select(Contrato).where(Contrato.jogador_id == player_id, Contrato.situacao == "ATIVO")
    return db.scalar(stmt)