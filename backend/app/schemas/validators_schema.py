import re
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BeforeValidator, Field, PlainSerializer

from app.utils.location import BRT
from app.utils.validators import count_words, normalize_text

_QUERY_INT = re.compile(r"[1-9][0-9]*")
_QUERY_DECIMAL = re.compile(r"(0|[1-9][0-9]*)(\.[0-9]{1,2})?")
SORT_OPTIONS = ("name", "value_asc", "value_desc", "age_asc", "age_desc", "position")
BrtDateTime = Annotated[
    datetime,
    PlainSerializer(
        lambda value: value.astimezone(BRT).isoformat(timespec="seconds"),
        return_type=str,
        when_used="json",
    ),
]
_LOYALTY_FORMAT = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}-03:00")
_ACRONYM = re.compile(r"[A-Z]{3}")


def _strict_int(value):
    if isinstance(value, bool):
        raise ValueError("deve ser um número inteiro")
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    raise ValueError("deve ser um número inteiro")


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


def _parse_query_int(value):
    if isinstance(value, int) and not isinstance(value, bool):
        if value > 0:
            return value

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


def _validate_sort(value) -> str:
    if not isinstance(value, str):
        raise ValueError("deve ser um texto")
    criteria = value.split(",")
    if len(criteria) > 2 or any(item not in SORT_OPTIONS for item in criteria):
        raise ValueError(f"use até dois critérios de: {', '.join(SORT_OPTIONS)}")
    fields = [item.removesuffix("_asc").removesuffix("_desc") for item in criteria]
    if len(set(fields)) != len(fields):
        raise ValueError("não repita o mesmo campo na ordenação")
    return value


def check_agility_for_age(age: int, agility: int) -> None:
    if age >= 35 and agility > 85:
        raise ValueError("agility: com 35 anos ou mais, o máximo é 85")


def _validate_club_name(value) -> str:
    if not isinstance(value, str):
        raise ValueError("deve ser um texto")
    name = normalize_text(value)
    if not 3 <= len(name) <= 60:
        raise ValueError("deve ter de 3 a 60 caracteres")
    if any(not (char.isalpha() or char in " .-") for char in name):
        raise ValueError("só pode conter letras, espaços, hífen e ponto")
    if not 2 <= count_words(name) <= 5:
        raise ValueError("deve ter de 2 a 5 palavras")
    return name


def _validate_acronym(value) -> str:
    if not isinstance(value, str) or not _ACRONYM.fullmatch(value):
        raise ValueError("deve ter exatamente 3 letras de A a Z, maiúsculas e sem acento")
    if len(set(value)) == 1:
        raise ValueError("as três letras não podem ser todas iguais")
    return value


def _parse_loyalty_until(value) -> datetime:
    if not isinstance(value, str) or not _LOYALTY_FORMAT.fullmatch(value):
        raise ValueError("use o formato AAAA-MM-DDTHH:MM-03:00")
    try:
        return datetime.strptime(value[:16], "%Y-%m-%dT%H:%M").replace(tzinfo=BRT)
    except ValueError:
        raise ValueError("data ou hora inexistente") from None


def _validate_transaction_types(value) -> str:
    if not isinstance(value, str):
        raise ValueError("deve ser um texto")
    items = value.split(",")
    if any(item not in ("COMPRA", "VENDA") for item in items) or len(set(items)) != len(items):
        raise ValueError("use COMPRA, VENDA ou COMPRA,VENDA, sem espaços e sem repetir")
    return value


ClubName = Annotated[str, BeforeValidator(_validate_club_name)]
Acronym = Annotated[str, BeforeValidator(_validate_acronym)]
QueryInt = Annotated[int, BeforeValidator(_parse_query_int), Field(le=2_147_483_647)]
QueryAge = Annotated[int, BeforeValidator(_parse_query_int), Field(ge=16, le=45)]
QueryLimit = Annotated[int, BeforeValidator(_parse_query_int), Field(le=50)]
QueryValue = Annotated[Decimal, BeforeValidator(_parse_query_decimal), Field(ge=0, le=550)]
SearchText = Annotated[str, BeforeValidator(_validate_search)]
SortCriteria = Annotated[str, BeforeValidator(_validate_sort)]
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]
BodyId = Annotated[int, BeforeValidator(_strict_int), Field(ge=1, le=2_147_483_647)]
LoyaltyDateTime = Annotated[datetime, BeforeValidator(_parse_loyalty_until)]
TransactionTypes = Annotated[str, BeforeValidator(_validate_transaction_types)]
Agility = Annotated[int, BeforeValidator(_strict_int), Field(ge=1, le=100)]
Age = Annotated[int, BeforeValidator(_strict_int), Field(ge=16, le=45)]
Rating = Annotated[int, BeforeValidator(_strict_int), Field(ge=1, le=99)]
PlayerName = Annotated[str, BeforeValidator(_validate_player_name)]
