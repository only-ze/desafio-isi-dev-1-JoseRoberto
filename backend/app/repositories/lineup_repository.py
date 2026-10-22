from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import Escalacao, Jogador


def remove_player(db: Session, player_id: int) -> None:
    db.execute(delete(Escalacao).where(Escalacao.jogador_id == player_id))


def replace(db: Session, club_id: int, player_ids: list[int]) -> None:
    db.execute(delete(Escalacao).where(Escalacao.clube_id == club_id))
    db.add_all(Escalacao(clube_id=club_id, jogador_id=player_id) for player_id in player_ids)


def list_players(db: Session, club_id: int) -> list[Jogador]:
    stmt = select(Jogador).join(Escalacao, Escalacao.jogador_id == Jogador.id).where(Escalacao.clube_id == club_id)
    return list(db.scalars(stmt))
