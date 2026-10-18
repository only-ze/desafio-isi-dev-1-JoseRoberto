from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.validators_schema import Agility, Age, Rating, PlayerName, Money, check_agility_for_age
from app.utils.validators import Condition, Position
from app.schemas.validators_schema import (
    QueryAge, QueryInt, QueryLimit, QueryValue, SearchText, SortCriteria,
)

class PlayerCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")  

    name: PlayerName
    position: Position
    agility: Agility
    age: Age
    pace: Rating
    shooting: Rating
    passing: Rating
    dribbling: Rating
    defending: Rating
    physical: Rating
    potential: Rating

    def attributes(self) -> tuple[int, ...]:
        return (self.pace, self.shooting, self.passing,
                self.dribbling, self.defending, self.physical)
        
    @model_validator(mode="after")
    def check_cross_field_limits(self):
        check_agility_for_age(self.age, self.agility)
        attributes = self.attributes()
        highest = max(attributes)
        if sum(attributes) > 480:
            raise ValueError("a soma dos seis atributos não pode passar de 480")
        if self.potential < highest:
            raise ValueError("potential não pode ser menor que o maior atributo")
        if self.age >= 33 and self.potential != highest:
            raise ValueError("com 33 anos ou mais, potential deve ser igual ao maior atributo")
        return self

class PlayerOut(BaseModel):
    id: int
    name: str
    position: str
    agility: int
    age: int
    condition: str
    base_value: Money
    market_value: Money
    pace: int
    shooting: int
    passing: int
    dribbling: int
    defending: int
    physical: int
    potential: int
    overall: int
    club_id: int | None
  
class PlayerListQuery(BaseModel):
    search: SearchText | None = None
    position: Position | None = None
    condition: Condition | None = None
    free: Literal["true", "false"] | None = None
    club_id: QueryInt | None = None
    min_age: QueryAge | None = None
    max_age: QueryAge | None = None
    min_value: QueryValue | None = None
    max_value: QueryValue | None = None
    sort: SortCriteria = "name"
    page: QueryInt = 1
    limit: QueryLimit = 10

    @model_validator(mode="after")
    def check_combinations(self):
        if self.min_age is not None and self.max_age is not None and self.min_age > self.max_age:
            raise ValueError("min_age não pode ser maior que max_age")
        if self.min_value is not None and self.max_value is not None and self.min_value > self.max_value:
            raise ValueError("min_value não pode ser maior que max_value")
        if self.free == "true" and self.club_id is not None:
            raise ValueError("free=true não pode ser combinado com club_id")
        return self

    @property
    def free_filter(self) -> bool | None:
        return None if self.free is None else self.free == "true"

class PlayerUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: PlayerName
    position: Position
    agility: Agility
    age: Age

    @model_validator(mode="after")
    def check_agility(self):
        check_agility_for_age(self.age, self.agility)
        return self
    
class PageMeta(BaseModel):
    page: int
    limit: int
    total_items: int
    total_pages: int

class PlayerPage(BaseModel):
    data: list[PlayerOut]
    meta: PageMeta
    
class ConditionUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    condition: Condition