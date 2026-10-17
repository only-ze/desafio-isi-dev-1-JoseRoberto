import re
import unicodedata
from decimal import ROUND_HALF_UP, Decimal
from typing import Literal, get_args

CENT = Decimal("0.01")
Condition = Literal["APTO", "MAL_CONDICIONADO", "DOENTE"]
Position = Literal["GOL", "ZAG", "LAT", "MEI", "ATA"]
POSITIONS: tuple[str, ...] = get_args(Position)

_MULTIPLE_SPACES = re.compile(" {2,}")

def round_money(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)

def normalize_text(value: str) -> str:
    if any(unicodedata.category(char) == "Cc" for char in value):
        raise ValueError("não pode conter caracteres de controle")
    return _MULTIPLE_SPACES.sub(" ", value.strip(" "))

def count_words(text: str) -> int:
    return sum(
        1
        for word in text.split(" ")
        if any(unicodedata.category(char).startswith("L") for char in word)
    )
    
def fold_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value.lower())
    return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")