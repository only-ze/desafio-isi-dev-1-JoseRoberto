from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.validators_schema import Agility, Age, Rating, PlayerName, Money
from app.utils.validators import Position

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
        attributes = self.attributes()
        highest = max(attributes)
        if self.age >= 35 and self.agility > 85:
            raise ValueError("agility: com 35 anos ou mais, o máximo é 85")
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