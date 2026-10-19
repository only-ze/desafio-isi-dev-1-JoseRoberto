from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.validators_schema import (
    BodyId, BrtDateTime, LoyaltyDateTime, Money, QueryInt, TransactionTypes,
)

class BuyRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    club_id: BodyId
    loyalty_until: LoyaltyDateTime

class TransactionQuery(BaseModel):
    type: str | None = None
    player_id: QueryInt | None = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, value):
        if value is None:
            return value
        items = value.split(",")
        if any(item not in ("COMPRA", "VENDA") for item in items) or len(set(items)) != len(items):
            raise ValueError("use COMPRA, VENDA ou COMPRA,VENDA, sem espaços e sem repetir")
        return value

    @property
    def types(self) -> tuple[str, ...] | None:
        return tuple(self.type.split(",")) if self.type else None

class TransactionOut(BaseModel):
    id: int
    club_id: int
    player_id: int
    player_name: str
    type: str
    value: Money
    fee: Money
    penalty: Money
    profit: Money | None
    cash_change: Money
    created_at: BrtDateTime

class NewContractOut(BaseModel):
    purchase_value: Money
    loyalty_until: BrtDateTime
    status: str

class BuyOut(TransactionOut):
    contract: NewContractOut
    club_cash: Money

class SellOut(TransactionOut):
    purchase_value: Money
    remaining_days: int
    penalty_rate: int
    contract_status: str
    club_cash: Money

class SummaryOut(BaseModel):
    total_spent: Money
    total_received: Money
    total_fees: Money
    total_penalties: Money
    total_profit: Money

class TransactionListOut(BaseModel):
    data: list[TransactionOut]
    summary: SummaryOut