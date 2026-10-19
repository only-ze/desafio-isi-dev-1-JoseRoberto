from sqlalchemy.orm import Session
from app.domain.standings import compute_standings
from app.repositories import club_repository, match_repository
from app.schemas.matches_schema import StandingOut

def get_standings(db: Session) -> list[StandingOut]:
    clubs = [(club.id, club.nome) for club in club_repository.list_all(db)]
    rows = compute_standings(clubs, match_repository.list_scores(db))
    return [
        StandingOut(
            position=position,
            club_id=row.club_id,
            club_name=row.club_name,
            played=row.played,
            wins=row.wins,
            draws=row.draws,
            losses=row.losses,
            goals_for=row.goals_for,
            goals_against=row.goals_against,
            goal_difference=row.goal_difference,
            points=row.points,
        )
        for position, row in enumerate(rows, start=1)
    ]