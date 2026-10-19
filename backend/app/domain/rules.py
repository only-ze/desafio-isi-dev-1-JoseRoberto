from datetime import datetime, timedelta
from decimal import Decimal
from app.utils.validators import fold_text

INITIAL_CASH = Decimal("300.00")
MAX_CLUBS = 20
ONE_DAY = timedelta(days=1)

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