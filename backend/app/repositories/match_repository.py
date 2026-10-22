from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Partida


def add(db: Session, match: Partida) -> Partida:
    db.add(match)
    db.flush()
    return match


def get(db: Session, match_id: int) -> Partida | None:
    return db.get(Partida, match_id)


def list_matches(db: Session, club_id: int | None) -> list[Partida]:
    stmt = select(Partida)
    if club_id is not None:
        stmt = stmt.where(or_(Partida.mandante_id == club_id, Partida.visitante_id == club_id))
    return list(db.scalars(stmt.order_by(Partida.jogada_em.desc(), Partida.id.desc())))


def list_scores(db: Session) -> list[tuple[int, int, int, int]]:
    stmt = select(Partida.mandante_id, Partida.visitante_id, Partida.gols_mandante, Partida.gols_visitante)
    return [(home, away, home_goals, away_goals) for home, away, home_goals, away_goals in db.execute(stmt)]
