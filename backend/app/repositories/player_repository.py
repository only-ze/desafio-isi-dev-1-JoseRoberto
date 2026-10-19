from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models import Jogador

_ACTIVE = Jogador.excluido_em.is_(None)

def add(db: Session, player: Jogador) -> Jogador:
    db.add(player)
    db.flush()
    return player

def get_active(db: Session, player_id: int, lock: bool = False) -> Jogador | None:
    stmt = select(Jogador).where(Jogador.id == player_id, _ACTIVE)
    if lock:
        stmt = stmt.with_for_update()
    return db.scalar(stmt)


def list_active(
    db: Session,
    *,
    position: str | None,
    condition: str | None,
    free: bool | None,
    club_id: int | None,
    min_age: int,
    max_age: int,
) -> list[Jogador]:
    stmt = select(Jogador).where(_ACTIVE, Jogador.idade.between(min_age, max_age))
    if position is not None:
        stmt = stmt.where(Jogador.posicao == position)
    if condition is not None:
        stmt = stmt.where(Jogador.condicao == condition)
    if club_id is not None:
        stmt = stmt.where(Jogador.clube_id == club_id)
    elif free is True:
        stmt = stmt.where(Jogador.clube_id.is_(None))
    elif free is False:
        stmt = stmt.where(Jogador.clube_id.is_not(None))
    return list(db.scalars(stmt))

def list_by_club(db: Session, club_id: int) -> list[Jogador]:
    return list(db.scalars(select(Jogador).where(_ACTIVE, Jogador.clube_id == club_id)))

def list_in_clubs(db: Session) -> list[Jogador]:
    return list(db.scalars(select(Jogador).where(_ACTIVE, Jogador.clube_id.is_not(None))))

def count_by_club(db: Session, club_id: int) -> int:
    stmt = select(func.count()).select_from(Jogador).where(_ACTIVE, Jogador.clube_id == club_id)
    return db.scalar(stmt) or 0