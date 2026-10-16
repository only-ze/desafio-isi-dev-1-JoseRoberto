from decimal import Decimal
from app.utils.validators import round_money

MIN_VALUE = Decimal("1.00")

OVERALL_WEIGHTS = {
    "GOL": (10, 0, 20, 0, 40, 30),
    "ZAG": (10, 0, 15, 0, 45, 30),
    "LAT": (25, 0, 20, 15, 25, 15),
    "MEI": (10, 15, 35, 25, 5, 10),
    "ATA": (20, 40, 10, 20, 0, 10),
}

_OVERALL_BANDS = (
    (41, 60, Decimal("0.50")),
    (61, 75, Decimal("2.00")),
    (76, 99, Decimal("6.00")),
)

CONDITION_DISCOUNT = {
    "APTO": Decimal(0),
    "MAL_CONDICIONADO": Decimal(15),
    "DOENTE": Decimal(30),
}

def calculate_overall(position: str, attributes: tuple[int, ...]) -> int:
    weighted_sum = sum(a * w for a, w in zip(attributes, OVERALL_WEIGHTS[position]))
    return (weighted_sum + 50) // 100

def calculate_base_value(overall: int, potential: int, age: int) -> Decimal:
    part = sum(
        ((min(overall, last) - first + 1) * rate
         for first, last, rate in _OVERALL_BANDS if overall >= first),
        Decimal(0),
    )
    if age <= 21:
        part = part * (100 + potential - overall) / 100
    return max(round_money(part), MIN_VALUE)

def calculate_market_value(base_value: Decimal, condition: str, agility: int, age: int) -> Decimal:
    discount = CONDITION_DISCOUNT[condition]
    if condition != "APTO":
        if agility >= 80:
            discount = discount / 2
        elif agility <= 30:
            discount = discount + 10
    age_adjustment = 10 if age <= 21 else (0 if age <= 31 else -10)
    total = max(age_adjustment - discount, Decimal(-40))
    return max(round_money(base_value * (100 + total) / 100), MIN_VALUE)