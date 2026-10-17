from decimal import Decimal
import re
from typing import Annotated
from pydantic import BeforeValidator, Field, PlainSerializer
from app.utils.validators import count_words, normalize_text

_QUERY_INT = re.compile(r"[1-9][0-9]*")
_QUERY_DECIMAL = re.compile(r"(0|[1-9][0-9]*)(\.[0-9]{1,2})?")
SORT_OPTIONS = ("name", "value_asc", "value_desc", "age_asc", "age_desc", "position")

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

def _parse_query_int(value):
    if not isinstance(value, str) or not _QUERY_INT.fullmatch(value):
        raise ValueError("deve ser um inteiro positivo, só com dígitos e sem zeros à esquerda")
    return int(value)


def _parse_query_decimal(value):
    if not isinstance(value, str) or not _QUERY_DECIMAL.fullmatch(value):
        raise ValueError("deve ser um decimal como 10, 10.5 ou 10.55")
    return Decimal(value)


def _validate_search(value) -> str:
    if not isinstance(value, str):
        raise ValueError("deve ser um texto")
    text = normalize_text(value)
    if not 2 <= len(text) <= 100:
        raise ValueError("deve ter de 2 a 100 caracteres")
    return text


def _parse_sort(value) -> tuple[str, ...]:
    if not isinstance(value, str):
        raise ValueError("deve ser um texto")
    criteria = tuple(value.split(","))
    if len(criteria) > 2 or any(item not in SORT_OPTIONS for item in criteria):
        raise ValueError(f"use até dois critérios de: {', '.join(SORT_OPTIONS)}")
    fields = [item.removesuffix("_asc").removesuffix("_desc") for item in criteria]
    if len(set(fields)) != len(fields):
        raise ValueError("não repita o mesmo campo na ordenação")
    return criteria


QueryInt = Annotated[int, BeforeValidator(_parse_query_int), Field(le=2_147_483_647)]
QueryAge = Annotated[int, BeforeValidator(_parse_query_int), Field(ge=16, le=45)]
QueryLimit = Annotated[int, BeforeValidator(_parse_query_int), Field(le=50)]
QueryValue = Annotated[Decimal, BeforeValidator(_parse_query_decimal), Field(ge=0, le=550)]
SearchText = Annotated[str, BeforeValidator(_validate_search)]
SortCriteria = Annotated[tuple[str, ...], BeforeValidator(_parse_sort)]