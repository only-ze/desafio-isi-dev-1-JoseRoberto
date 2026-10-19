from collections import defaultdict
from datetime import datetime
from decimal import Decimal
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.clock import now
from app.core.errors import BusinessRuleError, NotFoundError
from app.domain.rules import INITIAL_CASH, MAX_CLUBS, penalty_rate, remaining_days
from app.models import Clube, Contrato, Jogador
from app.repositories import club_repository, contract_repository, player_repository
from app.schemas.clubs_schema import (
    ClubCreate, ClubDetailOut, ClubListQuery, ClubOut, ContractOut, SquadPlayerOut,
)
from app.services.player_mapper import market_value_of, to_player_out
from app.utils.validators import POSITIONS, fold_text, squad_sort_key

def create_club(db: Session, data: ClubCreate) -> ClubOut:
    if club_repository.count(db) >= MAX_CLUBS:
        raise BusinessRuleError("A liga aceita no máximo 20 clubes.")
    if club_repository.name_exists(db, data.name):
        raise BusinessRuleError("Já existe um clube com esse nome.")
    if club_repository.acronym_exists(db, data.acronym):
        raise BusinessRuleError("Já existe um clube com essa sigla.")

    club = Clube(nome=data.name, sigla=data.acronym, caixa=INITIAL_CASH)
    club_repository.add(db, club)
    try:
        db.commit()
    except IntegrityError:  
        db.rollback()
        raise BusinessRuleError("Já existe um clube com esse nome ou sigla.")
    return _to_club_out(club, [])

def get_club(db: Session, club_id: int) -> ClubDetailOut:
    club = club_repository.get(db, club_id)
    if club is None:
        raise NotFoundError("Clube não encontrado.")

    players = sorted(
        player_repository.list_by_club(db, club.id),
        key=lambda p: squad_sort_key(p.posicao, p.nome, p.id),
    )
    contracts = contract_repository.active_by_club(db, club.id)
    moment = now()
    summary = _to_club_out(club, players)
    return ClubDetailOut(
        **summary.model_dump(),
        players=[
            SquadPlayerOut(
                **to_player_out(player).model_dump(),
                contract=_to_contract_out(contracts[player.id], moment),
            )
            for player in players
        ],
    )

def list_clubs(db: Session, query: ClubListQuery) -> list[ClubOut]:
    players_by_club: dict[int, list[Jogador]] = defaultdict(list)
    for player in player_repository.list_in_clubs(db):
        players_by_club[player.clube_id].append(player)

    clubs = [_to_club_out(club, players_by_club[club.id]) for club in club_repository.list_all(db)]
    clubs.sort(key=_club_sort_key(query.sort))
    return clubs

def _club_sort_key(sort: str):
    def key(club: ClubOut):
        name_and_id = (fold_text(club.name), club.id)
        if sort == "net_worth_asc":
            return (club.net_worth, *name_and_id)
        if sort == "net_worth_desc":
            return (-club.net_worth, *name_and_id)
        return name_and_id
    return key

def _to_club_out(club: Clube, players: list[Jogador]) -> ClubOut:
    squad_value = sum((market_value_of(player) for player in players), Decimal("0.00"))
    return ClubOut(
        id=club.id,
        name=club.nome,
        acronym=club.sigla,
        cash=club.caixa,
        squad_value=squad_value,
        net_worth=club.caixa + squad_value,
    )

def _to_contract_out(contract: Contrato, moment: datetime) -> ContractOut:
    days = remaining_days(contract.fidelidade_ate, moment)
    return ContractOut(
        purchase_value=contract.valor_compra,
        loyalty_until=contract.fidelidade_ate,
        remaining_days=days,
        penalty_rate=penalty_rate(days),
    )