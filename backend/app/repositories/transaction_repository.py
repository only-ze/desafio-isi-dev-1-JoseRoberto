from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import Transacao

def add(db: Session, transaction: Transacao) -> Transacao:
    db.add(transaction)
    db.flush()
    return transaction

def club_sold_player(db: Session, club_id: int, player_id: int) -> bool:
    stmt = select(Transacao.id).where(
        Transacao.clube_id == club_id,
        Transacao.jogador_id == player_id,
        Transacao.tipo == "VENDA",
    )
    return db.scalar(stmt.limit(1)) is not None

def list_by_club(
    db: Session,
    club_id: int,
    types: tuple[str, ...] | None,
    player_id: int | None,
) -> list[Transacao]:
    stmt = select(Transacao).where(Transacao.clube_id == club_id)

    if types:
        stmt = stmt.where(Transacao.tipo.in_(types))

    if player_id is not None:
        stmt = stmt.where(Transacao.jogador_id == player_id)

    stmt = stmt.order_by(Transacao.criado_em.desc(), Transacao.id.desc())

    return list(db.scalars(stmt))
