from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Contrato

def active_by_club(db: Session, club_id: int) -> dict[int, Contrato]:
    stmt = select(Contrato).where(Contrato.clube_id == club_id, Contrato.situacao == "ATIVO")
    return {contract.jogador_id: contract for contract in db.scalars(stmt)}