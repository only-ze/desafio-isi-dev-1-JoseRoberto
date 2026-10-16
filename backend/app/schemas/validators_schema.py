from decimal import Decimal
from typing import Annotated
from pydantic import BeforeValidator, Field, PlainSerializer
from app.utils.validators import count_words, normalize_text

Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]

def _strict_int(value):
    if isinstance(value, bool):
        raise ValueError("deve ser um número inteiro")
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    raise ValueError("deve ser um número inteiro")

Agility = Annotated[int, BeforeValidator(_strict_int), Field(ge=1, le=100)]
Age = Annotated[int, BeforeValidator(_strict_int), Field(ge=16, le=45)]
Rating = Annotated[int, BeforeValidator(_strict_int), Field(ge=1, le=99)]

def _validate_player_name(value) -> str:
    if not isinstance(value, str):
        raise ValueError("deve ser um texto")
    name = normalize_text(value)
    if not 3 <= len(name) <= 100:
        raise ValueError("deve ter de 3 a 100 caracteres")
    if any(char in "0123456789" for char in name):
        raise ValueError("não pode conter números")
    if count_words(name) < 2:
        raise ValueError("deve ter pelo menos duas palavras")
    return name

PlayerName = Annotated[str, BeforeValidator(_validate_player_name)]