from decimal import Decimal

import pytest

from app.utils.player_value import calculate_base_value, calculate_market_value, calculate_overall


@pytest.mark.parametrize(
    ("base_value", "condition", "agility", "age", "expected"),
    [
        ("82.00", "APTO", 20, 25, "82.00"),
        ("82.00", "APTO", 50, 19, "90.20"),
        ("82.00", "MAL_CONDICIONADO", 50, 25, "69.70"),
        ("82.00", "MAL_CONDICIONADO", 80, 21, "84.05"),
        ("82.00", "MAL_CONDICIONADO", 30, 33, "53.30"),
        ("82.00", "DOENTE", 90, 25, "69.70"),
        ("82.00", "DOENTE", 30, 25, "49.20"),
        ("82.00", "DOENTE", 10, 40, "49.20"),
        ("9.50", "MAL_CONDICIONADO", 85, 25, "8.79"),
        ("1.00", "MAL_CONDICIONADO", 50, 35, "1.00"),
    ],
)
def test_market_value_follows_condition_agility_and_age(base_value, condition, agility, age, expected):
    assert calculate_market_value(Decimal(base_value), condition, agility, age) == Decimal(expected)


@pytest.mark.parametrize(
    ("position", "attributes", "expected"),
    [
        ("MEI", (68, 65, 80, 78, 52, 60), 73),
        ("ATA", (78, 75, 73, 82, 48, 68), 76),
        ("LAT", (72, 70, 78, 76, 70, 66), 72),
        ("ZAG", (50, 90, 60, 40, 80, 75), 73),
        ("GOL", (55, 30, 65, 40, 72, 68), 68),
    ],
)
def test_overall_uses_position_weights_and_rounds_half_up(position, attributes, expected):
    assert calculate_overall(position, attributes) == expected


@pytest.mark.parametrize(
    ("overall", "potential", "age", "expected"),
    [
        (75, 86, 25, "40.00"),
        (60, 70, 30, "10.00"),
        (61, 70, 30, "12.00"),
        (76, 80, 22, "46.00"),
        (85, 92, 27, "100.00"),
        (70, 84, 21, "34.20"),
        (70, 84, 22, "30.00"),
        (45, 90, 18, "3.63"),
        (40, 66, 36, "1.00"),
    ],
)
def test_base_value_uses_progressive_bands_young_bonus_and_floor(overall, potential, age, expected):
    assert calculate_base_value(overall, potential, age) == Decimal(expected)
