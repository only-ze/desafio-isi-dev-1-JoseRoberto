from app.domain.standings import compute_standings

CLUBS = [
    (1, "Águias FC"),
    (2, "Delta FC"),
    (3, "Gama SC"),
    (4, "Épsilon EC"),
    (5, "Mangue FC"),
    (6, "Tubarões EC"),
]
MATCHES = [
    (1, 2, 1, 2),
    (3, 4, 2, 1),
    (4, 1, 3, 2),
    (2, 3, 0, 1),
]


def test_readme_standings_order_and_tiebreakers():
    rows = compute_standings(CLUBS, MATCHES)

    assert [row.club_name for row in rows] == [
        "Gama SC",
        "Épsilon EC",
        "Delta FC",
        "Mangue FC",
        "Tubarões EC",
        "Águias FC",
    ]
    assert [(row.points, row.goal_difference, row.goals_for) for row in rows] == [
        (6, 2, 3),
        (3, 0, 4),
        (3, 0, 2),
        (0, 0, 0),
        (0, 0, 0),
        (0, -2, 3),
    ]


def test_clubs_without_matches_appear_with_zeros():
    rows = compute_standings(CLUBS[:2], [])

    assert [(row.club_name, row.played, row.points) for row in rows] == [("Águias FC", 0, 0), ("Delta FC", 0, 0)]
