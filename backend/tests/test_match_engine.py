from app.domain import match_engine
from app.domain.match_engine import Starter


def _starter(player_id, name, position, condition="APTO", shooting=50, passing=50, dribbling=50, defending=50):
    return Starter(player_id, name, position, condition, shooting, passing, dribbling, defending)


def _aguias():
    return match_engine.build_team(
        1,
        "2-1-1",
        [
            _starter(34, "Otto Rangel", "ATA", shooting=75),
            _starter(31, "Davi Lins", "LAT", "MAL_CONDICIONADO", dribbling=74, defending=66),
            _starter(30, "Rui Prado", "GOL", defending=77),
            _starter(33, "Lauro Neves", "MEI", passing=82),
            _starter(32, "Téo Brandão", "ZAG", defending=84),
        ],
    )


def _delta():
    return match_engine.build_team(
        2,
        "2-1-1",
        [
            _starter(40, "Ivo Teles", "GOL", defending=72),
            _starter(41, "Hugo Vaz", "ZAG", defending=84),
            _starter(42, "Lino Matos", "LAT", dribbling=79, defending=63),
            _starter(43, "Nei Soares", "MEI", passing=70),
            _starter(44, "Ugo Falcão", "ATA", shooting=81),
        ],
    )


def test_readme_match_ends_one_to_two():
    result = match_engine.play(_aguias(), _delta())

    assert (result.home_goals, result.away_goals) == (1, 2)
    assert [duel.goal for duel in result.duels] == [True, False, False, True, False, True]


def test_duels_follow_squad_order_and_attack_attribute():
    duels = match_engine.play(_aguias(), _delta()).duels

    assert [(d.order, d.attacker.name, d.defender.name) for d in duels] == [
        (1, "Otto Rangel", "Ivo Teles"),
        (2, "Lauro Neves", "Hugo Vaz"),
        (3, "Davi Lins", "Lino Matos"),
        (4, "Ugo Falcão", "Rui Prado"),
        (5, "Nei Soares", "Téo Brandão"),
        (6, "Lino Matos", "Davi Lins"),
    ]
    assert [d.attack_attribute for d in duels] == ["shooting", "passing", "dribbling"] * 2


def test_unfit_starter_plays_with_fifteen_percent_less_rounded_half_up():
    duels = match_engine.play(_aguias(), _delta()).duels

    assert duels[2].attack_value == 63
    assert duels[2].goal is False
    assert duels[5].defense_value == 56
