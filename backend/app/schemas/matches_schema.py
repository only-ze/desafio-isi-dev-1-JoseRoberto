from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.validators_schema import BodyId, BrtDateTime, QueryInt


class MatchCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    home_club_id: BodyId
    away_club_id: BodyId

    @model_validator(mode="after")
    def check_distinct_clubs(self):
        if self.home_club_id == self.away_club_id:
            raise ValueError("o mandante e o visitante não podem ser o mesmo clube")
        return self


class MatchListQuery(BaseModel):
    club_id: QueryInt | None = None


class MatchSideOut(BaseModel):
    club_id: int
    club_name: str
    formation: str
    goals: int


class DuelParticipantOut(BaseModel):
    player_id: int
    player_name: str
    position: str
    condition: str
    attribute: str
    value: int


class DuelOut(BaseModel):
    order: int
    attacking_club_id: int
    attacker: DuelParticipantOut
    defender: DuelParticipantOut
    goal: bool


class MatchSummaryOut(BaseModel):
    id: int
    played_at: BrtDateTime
    home: MatchSideOut
    away: MatchSideOut
    result: str


class MatchOut(MatchSummaryOut):
    duels: list[DuelOut]


class StandingOut(BaseModel):
    position: int
    club_id: int
    club_name: str
    played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int
