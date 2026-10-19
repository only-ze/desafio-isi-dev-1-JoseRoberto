from datetime import datetime, timedelta
from decimal import Decimal
from app.utils.validators import fold_text, round_money

INITIAL_CASH = Decimal("300.00")
MAX_CLUBS = 20
ONE_DAY = timedelta(days=1)
FEE_THRESHOLD = Decimal("30.00")
FEE_RATE = Decimal("0.05")
MAX_PENALTY = Decimal("10.00")
SQUAD_LIMIT = 12
MAX_LOYALTY = timedelta(days=1095)

def acronym_matches_name(acronym: str, name: str) -> bool:
    letters = [char for char in fold_text(name) if char.isalpha()]
    wanted = acronym.lower()
    if not letters or letters[0] != wanted[0]:
        return False
    position = 1
    for char in wanted[1:]:
        try:
            position = letters.index(char, position) + 1
        except ValueError:
            return False
    return True

def remaining_days(loyalty_until: datetime, moment: datetime) -> int:
    remaining = loyalty_until - moment
    if remaining <= timedelta(0):
        return 0
    whole_days, rest = divmod(remaining, ONE_DAY)
    return whole_days + (1 if rest else 0)

def penalty_rate(days: int) -> int:
    if days == 0:
        return 0
    if days <= 30:
        return 5
    if days <= 180:
        return 10
    return 20

def purchase_fee(value: Decimal) -> Decimal:
    return round_money(value * FEE_RATE) if value > FEE_THRESHOLD else Decimal("0.00")

def exceeds_cash_limit(cost: Decimal, cash: Decimal) -> bool:
    return cost * 2 > cash

def sale_penalty(value: Decimal, rate: int) -> Decimal:
    return min(round_money(value * rate / 100), MAX_PENALTY)

def sale_commission(profit: Decimal) -> Decimal:
    if profit <= 0:
        return Decimal("0.00")
    first_part = min(profit, Decimal("10.00"))
    second_part = profit - first_part
    return round_money(first_part * Decimal("0.10") + second_part * Decimal("0.20"))