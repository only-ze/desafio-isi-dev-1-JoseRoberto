from app.models import DueloPartida, Partida
from app.schemas.matches_schema import (
    DuelOut, DuelParticipantOut, MatchOut, MatchSideOut, MatchSummaryOut,
)

def _result(home_goals: int, away_goals: int) -> str:
    if home_goals > away_goals:
        return "MANDANTE"
    if away_goals > home_goals:
        return "VISITANTE"
    return "EMPATE"

def to_match_summary(match: Partida, names: dict[int, str]) -> MatchSummaryOut:
    return MatchSummaryOut(
        id=match.id,
        played_at=match.jogada_em,
        home=MatchSideOut(
            club_id=match.mandante_id, club_name=names[match.mandante_id],
            formation=match.formacao_mandante, goals=match.gols_mandante,
        ),
        away=MatchSideOut(
            club_id=match.visitante_id, club_name=names[match.visitante_id],
            formation=match.formacao_visitante, goals=match.gols_visitante,
        ),
        result=_result(match.gols_mandante, match.gols_visitante),
    )

def to_match_out(match: Partida, names: dict[int, str]) -> MatchOut:
    summary = to_match_summary(match, names)
    return MatchOut(**summary.model_dump(), duels=[_to_duel_out(duel) for duel in match.duelos])

def _to_duel_out(duel: DueloPartida) -> DuelOut:
    return DuelOut(
        order=duel.ordem,
        attacking_club_id=duel.clube_atacante_id,
        attacker=DuelParticipantOut(
            player_id=duel.atacante_id, player_name=duel.nome_atacante,
            position=duel.posicao_atacante, condition=duel.condicao_atacante,
            attribute=duel.atributo_ataque, value=duel.valor_ataque,
        ),
        defender=DuelParticipantOut(
            player_id=duel.defensor_id, player_name=duel.nome_defensor,
            position=duel.posicao_defensor, condition=duel.condicao_defensor,
            attribute=duel.atributo_defesa, value=duel.valor_defesa,
        ),
        goal=duel.gol,
    )