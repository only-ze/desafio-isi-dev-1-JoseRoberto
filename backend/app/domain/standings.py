from dataclasses import dataclass
from app.utils.validators import fold_text

@dataclass
class StandingRow:
    club_id: int
    club_name: str
    played: int = 0
    wins: int = 0
    draws: int = 0
    losses: int = 0
    goals_for: int = 0
    goals_against: int = 0

    @property
    def goal_difference(self) -> int:
        return self.goals_for - self.goals_against

    @property
    def points(self) -> int:
        return self.wins * 3 + self.draws

def _register(row: StandingRow, goals_for: int, goals_against: int) -> None:
    row.played += 1
    row.goals_for += goals_for
    row.goals_against += goals_against
    if goals_for > goals_against:
        row.wins += 1
    elif goals_for == goals_against:
        row.draws += 1
    else:
        row.losses += 1

def compute_standings(
    clubs: list[tuple[int, str]], matches: list[tuple[int, int, int, int]]
) -> list[StandingRow]:
    rows = {club_id: StandingRow(club_id, name) for club_id, name in clubs}
    for home_id, away_id, home_goals, away_goals in matches:
        _register(rows[home_id], home_goals, away_goals)
        _register(rows[away_id], away_goals, home_goals)
    return sorted(
        rows.values(),
        key=lambda r: (-r.points, -r.goal_difference, -r.goals_for, fold_text(r.club_name), r.club_id),
    )