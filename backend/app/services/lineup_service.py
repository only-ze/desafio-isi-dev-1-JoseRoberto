from sqlalchemy.orm import Session

from app.core.errors import BusinessRuleError, NotFoundError
from app.domain.rules import LINEUP_SIZE, fits_formation
from app.models import Clube, Jogador
from app.repositories import club_repository, lineup_repository, player_repository
from app.schemas.lineups_schema import LineupOut, LineupUpdate
from app.services.player_mapper import to_player_out
from app.utils.validators import squad_sort_key


def set_lineup(db: Session, club_id: int, data: LineupUpdate) -> LineupOut:
    players = player_repository.list_active_by_ids(db, data.player_ids, lock=True)
    club = club_repository.get(db, club_id, lock=True)
    if club is None:
        raise NotFoundError("Clube não encontrado.")
    if len(players) != len(data.player_ids):
        raise NotFoundError("Jogador não encontrado.")

    for player in players:
        if player.clube_id != club.id:
            raise BusinessRuleError(f"{player.nome} não está no elenco do clube.")
        if player.condicao == "DOENTE":
            raise BusinessRuleError(f"{player.nome} está DOENTE e não pode ser escalado.")
    if not fits_formation(data.formation, [player.posicao for player in players]):
        raise BusinessRuleError(
            f"As posições não fecham a formação {data.formation}: use 1 GOL e os jogadores de linha de cada setor."
        )

    lineup_repository.replace(db, club.id, [player.id for player in players])
    club.formacao = data.formation
    lineup = _to_lineup_out(club, players)
    db.commit()
    return lineup


def get_lineup(db: Session, club_id: int) -> LineupOut:
    club = club_repository.get(db, club_id)
    if club is None:
        raise NotFoundError("Clube não encontrado.")
    return _to_lineup_out(club, lineup_repository.list_players(db, club.id))


def _to_lineup_out(club: Clube, players: list[Jogador]) -> LineupOut:
    ordered = sorted(players, key=lambda p: squad_sort_key(p.posicao, p.nome, p.id))
    return LineupOut(
        club_id=club.id,
        formation=club.formacao,
        complete=len(ordered) == LINEUP_SIZE,
        players=[to_player_out(player) for player in ordered],
    )
