from datetime import datetime, timedelta
from decimal import Decimal

import pytest

from app.domain.rules import (
    acronym_matches_name,
    exceeds_cash_limit,
    fits_formation,
    penalty_rate,
    purchase_fee,
    remaining_days,
    sale_commission,
    sale_penalty,
)
from app.utils.location import BRT

SALE_MOMENT = datetime(2026, 11, 5, 16, 40, tzinfo=BRT)


@pytest.mark.parametrize(
    ("value", "expected"),
    [("28.00", "0.00"), ("30.00", "0.00"), ("30.01", "1.50"), ("47.62", "2.38"), ("48.00", "2.40")],
)
def test_purchase_fee_is_five_percent_only_above_thirty(value, expected):
    assert purchase_fee(Decimal(value)) == Decimal(expected)


@pytest.mark.parametrize(
    ("cost", "cash", "refused"),
    [("28.00", "300.00", False), ("50.00", "100.00", False), ("50.40", "100.00", True), ("130.58", "261.15", True)],
)
def test_cash_limit_is_half_of_cash_without_rounding(cost, cash, refused):
    assert exceeds_cash_limit(Decimal(cost), Decimal(cash)) is refused


@pytest.mark.parametrize(
    ("until_sale", "expected_days", "expected_rate"),
    [
        (timedelta(days=-1), 0, 0),
        (timedelta(0), 0, 0),
        (timedelta(days=10, hours=2), 11, 5),
        (timedelta(days=30), 30, 5),
        (timedelta(days=30, minutes=1), 31, 10),
        (timedelta(days=116, hours=17, minutes=35), 117, 10),
        (timedelta(days=180), 180, 10),
        (timedelta(days=180, minutes=1), 181, 20),
        (timedelta(days=200), 200, 20),
    ],
)
def test_remaining_days_round_up_and_set_the_penalty_rate(until_sale, expected_days, expected_rate):
    days = remaining_days(SALE_MOMENT + until_sale, SALE_MOMENT)
    assert days == expected_days
    assert penalty_rate(days) == expected_rate


@pytest.mark.parametrize(
    ("value", "rate", "expected"),
    [("40.00", 10, "4.00"), ("42.50", 20, "8.50"), ("30.00", 5, "1.50"), ("25.00", 0, "0.00"), ("75.00", 20, "10.00")],
)
def test_sale_penalty_is_capped_at_ten(value, rate, expected):
    assert sale_penalty(Decimal(value), rate) == Decimal(expected)


@pytest.mark.parametrize(
    ("profit", "expected"),
    [("3.00", "0.30"), ("3.85", "0.39"), ("10.00", "1.00"), ("10.01", "1.00"), ("15.00", "2.00"), ("-7.50", "0.00")],
)
def test_sale_commission_is_progressive_on_profit(profit, expected):
    assert sale_commission(Decimal(profit)) == Decimal(expected)


@pytest.mark.parametrize(
    ("acronym", "name", "matches"),
    [
        ("AGU", "Águias FC", True),
        ("LDS", "Leões da Serra", True),
        ("DEL", "Delta FC", True),
        ("DXZ", "Delta Norte", False),
        ("EFC", "Delta FC", False),
    ],
)
def test_acronym_letters_follow_the_name(acronym, name, matches):
    assert acronym_matches_name(acronym, name) is matches


@pytest.mark.parametrize(
    ("formation", "positions", "fits"),
    [
        ("2-1-1", ["GOL", "ZAG", "LAT", "MEI", "ATA"], True),
        ("3-1", ["GOL", "ZAG", "LAT", "LAT", "ATA"], True),
        ("2-2", ["GOL", "ZAG", "LAT", "ATA", "ATA"], True),
        ("1-2-1", ["GOL", "ZAG", "MEI", "MEI", "ATA"], True),
        ("3-1", ["GOL", "ZAG", "LAT", "MEI", "ATA"], False),
        ("2-1-1", ["GOL", "GOL", "LAT", "MEI", "ATA"], False),
    ],
)
def test_lineup_positions_must_fit_the_formation(formation, positions, fits):
    assert fits_formation(formation, positions) is fits
