from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.players_schema import PlayerOut
from app.schemas.validators_schema import BodyId
from app.utils.validators import Formation

class LineupUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    formation: Formation
    player_ids: Annotated[list[BodyId], Field(min_length=5, max_length=5)]

    @model_validator(mode="after")
    def check_distinct_ids(self):
        if len(set(self.player_ids)) != len(self.player_ids):
            raise ValueError("player_ids: os ids não podem se repetir")
        return self

class LineupOut(BaseModel):
    club_id: int
    formation: str | None
    complete: bool
    players: list[PlayerOut]