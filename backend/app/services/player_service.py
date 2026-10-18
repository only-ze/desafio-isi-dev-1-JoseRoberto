from decimal import Decimal
from sqlalchemy.orm import Session
from app.utils.player_value import calculate_base_value, calculate_overall
from app.models import Jogador
from app.repositories import player_repository
from app.schemas.players_schema import ConditionUpdate, PageMeta, PlayerListQuery, PlayerOut, PlayerPage, PlayerCreate, PlayerUpdate
from app.utils.validators import POSITIONS, fold_text
from app.core.errors import BusinessRuleError, NotFoundError
from app.repositories import club_repository
from app.services.player_mapper import to_player_out
from app.core.clock import now
from app.repositories import escalacao_repository

MIN_AGE, MAX_AGE = 16, 45
MIN_VALUE, MAX_VALUE = Decimal("0"), Decimal("550")

_SORT_KEYS = {
    "name": lambda p: fold_text(p.name),
    "value_asc": lambda p: p.market_value,
    "value_desc": lambda p: -p.market_value,
    "age_asc": lambda p: p.age,
    "age_desc": lambda p: -p.age,
    "position": lambda p: POSITIONS.index(p.position),
}

def create_player(db: Session, data: PlayerCreate) -> Jogador:
    overall = calculate_overall(data.position, data.attributes())
    player = Jogador(
        nome=data.name,
        posicao=data.position,
        agilidade=data.agility,
        idade=data.age,
        valor_base=calculate_base_value(overall, data.potential, data.age),
        condicao="APTO",
        clube_id=None,
        velocidade=data.pace,
        finalizacao=data.shooting,
        passe=data.passing,
        drible=data.dribbling,
        defesa=data.defending,
        fisico=data.physical,
        potencial=data.potential,
    )
    player_repository.add(db, player)
    db.commit()
    db.refresh(player)
    return player

def get_player(db: Session, player_id: int) -> Jogador:
    player = player_repository.get_active(db, player_id)
    if player is None:
        raise NotFoundError("Jogador não encontrado.")
    return player

def list_players(db: Session, query: PlayerListQuery) -> PlayerPage:
    if query.club_id is not None and not club_repository.exists(db, query.club_id):
        raise NotFoundError("Clube não encontrado.")

    players = player_repository.list_active(
        db,
        position=query.position,
        condition=query.condition,
        free=query.free_filter,
        club_id=query.club_id,
        min_age=query.min_age if query.min_age is not None else MIN_AGE,
        max_age=query.max_age if query.max_age is not None else MAX_AGE,
    )
    items = [to_player_out(player) for player in players]

    low = query.min_value if query.min_value is not None else MIN_VALUE
    high = query.max_value if query.max_value is not None else MAX_VALUE
    items = [item for item in items if low <= item.market_value <= high]

    if query.search is not None:
        term = fold_text(query.search)
        items = [item for item in items if term in fold_text(item.name)]

    items.sort(key=_sort_key(query.sort))

    total_items = len(items)
    start = (query.page - 1) * query.limit
    return PlayerPage(
        data=items[start:start + query.limit],
        meta=PageMeta(
            page=query.page,
            limit=query.limit,
            total_items=total_items,
            total_pages=(total_items + query.limit - 1) // query.limit,
        ),
    )
    
def update_player(db: Session, player_id: int, data: PlayerUpdate) -> Jogador:
    player = get_player(db, player_id)

    if player.clube_id is not None and data.position != player.posicao:
        raise BusinessRuleError("Jogador com clube não pode mudar de posição.")
    if data.age < player.idade:
        raise BusinessRuleError("A idade não pode ser menor que a idade atual.")

    player.nome = data.name
    player.posicao = data.position
    player.agilidade = data.agility
    player.idade = data.age
    db.commit()
    db.refresh(player)
    return player
def change_condition(db: Session, player_id: int, data: ConditionUpdate) -> Jogador:
    player = get_player(db, player_id)
    if player.condicao == "DOENTE" and data.condition == "APTO":
        raise BusinessRuleError("Jogador DOENTE não pode passar direto para APTO.")

    player.condicao = data.condition
    if data.condition == "DOENTE":
        escalacao_repository.remove_player(db, player.id)
    db.commit()
    db.refresh(player)
    return player

def delete_player(db: Session, player_id: int) -> None:
    player = get_player(db, player_id)
    if player.clube_id is not None:
        raise BusinessRuleError("Jogador com clube não pode ser excluído.")
    player.excluido_em = now()
    db.commit()
    
def _sort_key(criteria: tuple[str, ...]):
    def key(item: PlayerOut):
        return (*(_SORT_KEYS[c](item) for c in criteria), fold_text(item.name), item.id)
    return key