from dataclasses import dataclass
from app.utils.validators import squad_sort_key

ATTACK_ATTRIBUTE = {"ATA": "shooting", "MEI": "passing", "ZAG": "dribbling", "LAT": "dribbling"}
DEFENSE_ATTRIBUTE = "defending"
_MATCHUPS = ((3, None), (2, 0), (1, 1))

@dataclass(frozen=True)
class Starter:
    player_id: int
    name: str
    position: str
    condition: str
    shooting: int
    passing: int
    dribbling: int
    defending: int

@dataclass(frozen=True)
class Team:
    club_id: int
    formation: str
    goalkeeper: Starter
    line: tuple[Starter, ...]

@dataclass(frozen=True)
class DuelResult:
    order: int
    attacking_club_id: int
    attacker: Starter
    attack_attribute: str
    attack_value: int
    defender: Starter
    defense_value: int
    goal: bool

@dataclass(frozen=True)
class MatchResult:
    home_goals: int
    away_goals: int
    duels: tuple[DuelResult, ...]

def build_team(club_id: int, formation: str, starters: list[Starter]) -> Team:
    ordered = sorted(starters, key=lambda s: squad_sort_key(s.position, s.name, s.player_id))
    return Team(club_id, formation, goalkeeper=ordered[0], line=tuple(ordered[1:]))

def _effective(starter: Starter, attribute: str) -> int:
    value = getattr(starter, attribute)
    if starter.condition == "MAL_CONDICIONADO":
        return (value * 85 + 50) // 100
    return value

def _attack(first_order: int, attacking: Team, defending: Team) -> list[DuelResult]:
    duels = []
    for offset, (attacker_index, defender_index) in enumerate(_MATCHUPS):
        attacker = attacking.line[attacker_index]
        defender = (
            defending.goalkeeper if defender_index is None else defending.line[defender_index]
        )
        attribute = ATTACK_ATTRIBUTE[attacker.position]
        attack_value = _effective(attacker, attribute)
        defense_value = _effective(defender, DEFENSE_ATTRIBUTE)
        duels.append(DuelResult(
            order=first_order + offset,
            attacking_club_id=attacking.club_id,
            attacker=attacker,
            attack_attribute=attribute,
            attack_value=attack_value,
            defender=defender,
            defense_value=defense_value,
            goal=attack_value > defense_value,
        ))
    return duels

def play(home: Team, away: Team) -> MatchResult:
    duels = _attack(1, home, away) + _attack(4, away, home)
    return MatchResult(
        home_goals=sum(1 for d in duels if d.goal and d.attacking_club_id == home.club_id),
        away_goals=sum(1 for d in duels if d.goal and d.attacking_club_id == away.club_id),
        duels=tuple(duels),
    )