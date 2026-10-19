from typing import Literal
from pydantic import BaseModel, ConfigDict, model_validator
from app.domain.rules import acronym_matches_name
from app.schemas.players_schema import PlayerOut
from app.schemas.validators_schema import Acronym, BrtDateTime, ClubName, Money

class ClubCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: ClubName
    acronym: Acronym

    @model_validator(mode="after")
    def check_acronym_matches_name(self):
        if not acronym_matches_name(self.acronym, self.name):
            raise ValueError(
                "acronym: as letras devem aparecer no nome, na ordem, "
                "com a primeira sendo a primeira letra do nome"
            )
        return self

class ClubListQuery(BaseModel):
    sort: Literal["name", "net_worth_asc", "net_worth_desc"] = "name"

class ClubOut(BaseModel):
    id: int
    name: str
    acronym: str
    cash: Money
    squad_value: Money
    net_worth: Money

class ContractOut(BaseModel):
    purchase_value: Money
    loyalty_until: BrtDateTime
    remaining_days: int
    penalty_rate: int

class SquadPlayerOut(PlayerOut):
    contract: ContractOut

class ClubDetailOut(ClubOut):
    players: list[SquadPlayerOut]