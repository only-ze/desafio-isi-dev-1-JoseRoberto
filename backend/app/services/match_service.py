from sqlalchemy.orm import Session

from app.core.clock import now
from app.core.errors import BusinessRuleError, NotFoundError
from app.domain import match_engine
from app.domain.match_engine import DuelResult, Starter, Team
from app.domain.rules import LINEUP_SIZE
from app.models import Clube, DueloPartida, Jogador, Partida
from app.repositories import club_repository, lineup_repository, match_repository
from app.schemas.matches_schema import MatchCreate, MatchListQuery, MatchOut, MatchSummaryOut
from app.services.match_mapper import to_match_out, to_match_summary


def play_match(db: Session, data: MatchCreate) -> MatchOut:
    clubs: dict[int, Clube] = {}
    for club_id in sorted({data.home_club_id, data.away_club_id}):
        club = club_repository.get(db, club_id, lock=True)
        if club is None:
            raise NotFoundError("Clube não encontrado.")
        clubs[club_id] = club
    home, away = clubs[data.home_club_id], clubs[data.away_club_id]

    result = match_engine.play(_build_team(db, home), _build_team(db, away))

    match = Partida(
        mandante_id=home.id,
        visitante_id=away.id,
        gols_mandante=result.home_goals,
        gols_visitante=result.away_goals,
        formacao_mandante=home.formacao,
        formacao_visitante=away.formacao,
        jogada_em=now(),
        duelos=[_to_duel_row(duel) for duel in result.duels],
    )
    match_repository.add(db, match)
    out = to_match_out(match, {home.id: home.nome, away.id: away.nome})
    db.commit()
    return out


def get_match(db: Session, match_id: int) -> MatchOut:
    match = match_repository.get(db, match_id)
    if match is None:
        raise NotFoundError("Partida não encontrada.")
    return to_match_out(match, club_repository.names_by_id(db))


def list_matches(db: Session, query: MatchListQuery) -> list[MatchSummaryOut]:
    if query.club_id is not None and not club_repository.exists(db, query.club_id):
        raise NotFoundError("Clube não encontrado.")
    names = club_repository.names_by_id(db)
    return [to_match_summary(match, names) for match in match_repository.list_matches(db, query.club_id)]


def _build_team(db: Session, club: Clube) -> Team:
    players = lineup_repository.list_players(db, club.id)
    if club.formacao is None or len(players) != LINEUP_SIZE:
        raise BusinessRuleError(f"O clube {club.nome} não tem a escalação completa.")
    return match_engine.build_team(club.id, club.formacao, [_to_starter(p) for p in players])


def _to_starter(player: Jogador) -> Starter:
    return Starter(
        player_id=player.id,
        name=player.nome,
        position=player.posicao,
        condition=player.condicao,
        shooting=player.finalizacao,
        passing=player.passe,
        dribbling=player.drible,
        defending=player.defesa,
    )


def _to_duel_row(duel: DuelResult) -> DueloPartida:
    return DueloPartida(
        ordem=duel.order,
        clube_atacante_id=duel.attacking_club_id,
        atacante_id=duel.attacker.player_id,
        defensor_id=duel.defender.player_id,
        nome_atacante=duel.attacker.name,
        nome_defensor=duel.defender.name,
        posicao_atacante=duel.attacker.position,
        posicao_defensor=duel.defender.position,
        condicao_atacante=duel.attacker.condition,
        condicao_defensor=duel.defender.condition,
        atributo_ataque=duel.attack_attribute,
        atributo_defesa=match_engine.DEFENSE_ATTRIBUTE,
        valor_ataque=duel.attack_value,
        valor_defesa=duel.defense_value,
        gol=duel.goal,
    )
