from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.clock import now
from app.core.errors import BadRequestError, BusinessRuleError, NotFoundError
from app.domain.rules import (
    MAX_LOYALTY,
    SQUAD_LIMIT,
    exceeds_cash_limit,
    penalty_rate,
    purchase_fee,
    remaining_days,
    sale_commission,
    sale_penalty,
)
from app.models import Contrato, Transacao
from app.repositories import (
    club_repository,
    contract_repository,
    lineup_repository,
    player_repository,
    transaction_repository,
)
from app.schemas.market_schema import (
    BuyOut,
    BuyRequest,
    NewContractOut,
    SellOut,
    SummaryOut,
    TransactionListOut,
    TransactionQuery,
)
from app.services import player_service
from app.services.player_mapper import market_value_of
from app.services.transaction_csv import build_csv
from app.services.transaction_mapper import to_transaction_out
from app.utils.validators import round_money


def buy_player(db: Session, player_id: int, data: BuyRequest) -> BuyOut:
    moment = now()
    if not moment < data.loyalty_until <= moment + MAX_LOYALTY:
        raise BadRequestError("O fim da fidelidade deve ser futuro e no máximo 1.095 dias depois da compra.")

    player = player_service.get_player(db, player_id, lock=True)
    club = club_repository.get(db, data.club_id, lock=True)
    if club is None:
        raise NotFoundError("Clube não encontrado.")

    if player.clube_id is not None:
        raise BusinessRuleError("O jogador não está livre.")
    if transaction_repository.club_sold_player(db, club.id, player.id):
        raise BusinessRuleError("O clube não pode comprar um jogador que ele mesmo vendeu.")
    if player_repository.count_by_club(db, club.id) >= SQUAD_LIMIT:
        raise BusinessRuleError("O elenco já tem o máximo de 12 jogadores.")

    value = market_value_of(player)
    fee = purchase_fee(value)
    cost = value + fee
    if exceeds_cash_limit(cost, club.caixa):
        raise BusinessRuleError(f"O custo da compra ({cost}) passa do limite de 50% do caixa ({club.caixa / 2}).")

    club.caixa -= cost
    player.clube_id = club.id
    contract_repository.add(
        db,
        Contrato(
            jogador_id=player.id,
            clube_id=club.id,
            valor_compra=value,
            fidelidade_ate=data.loyalty_until,
            situacao="ATIVO",
            iniciado_em=moment,
        ),
    )
    transaction = transaction_repository.add(
        db,
        Transacao(
            clube_id=club.id,
            jogador_id=player.id,
            nome_jogador=player.nome,
            tipo="COMPRA",
            valor=value,
            taxa=fee,
            multa=Decimal("0.00"),
            lucro=None,
            variacao_caixa=-cost,
            criado_em=moment,
        ),
    )
    db.commit()

    return BuyOut(
        **to_transaction_out(transaction).model_dump(),
        contract=NewContractOut(purchase_value=value, loyalty_until=data.loyalty_until, status="ATIVO"),
        club_cash=club.caixa,
    )


def sell_player(db: Session, player_id: int) -> SellOut:
    player = player_service.get_player(db, player_id, lock=True)
    if player.clube_id is None:
        raise BusinessRuleError("Jogador livre não pode ser vendido.")
    club = club_repository.get(db, player.clube_id, lock=True)
    contract = contract_repository.active_of_player(db, player.id)

    moment = now()
    value = market_value_of(player)
    days = remaining_days(contract.fidelidade_ate, moment)
    rate = penalty_rate(days)
    penalty = sale_penalty(value, rate)
    profit = value - contract.valor_compra
    commission = sale_commission(profit)
    credit = value - penalty - commission

    contract.situacao = "RESCINDIDO" if penalty > 0 else "ENCERRADO"
    contract.encerrado_em = moment
    player.clube_id = None
    lineup_repository.remove_player(db, player.id)
    club.caixa += credit
    transaction = transaction_repository.add(
        db,
        Transacao(
            clube_id=club.id,
            jogador_id=player.id,
            nome_jogador=player.nome,
            tipo="VENDA",
            valor=value,
            taxa=commission,
            multa=penalty,
            lucro=profit,
            variacao_caixa=credit,
            criado_em=moment,
        ),
    )
    db.commit()

    return SellOut(
        **to_transaction_out(transaction).model_dump(),
        purchase_value=contract.valor_compra,
        remaining_days=days,
        penalty_rate=rate,
        contract_status=contract.situacao,
        club_cash=club.caixa,
    )


def list_transactions(db: Session, club_id: int, query: TransactionQuery) -> TransactionListOut:
    rows = _filtered_transactions(db, club_id, query)
    return TransactionListOut(data=[to_transaction_out(row) for row in rows], summary=_summarize(rows))


def export_transactions(db: Session, club_id: int, query: TransactionQuery) -> str:
    return build_csv(_filtered_transactions(db, club_id, query))


def _filtered_transactions(db: Session, club_id: int, query: TransactionQuery) -> list[Transacao]:
    if not club_repository.exists(db, club_id):
        raise NotFoundError("Clube não encontrado.")
    if query.player_id is not None:
        player_service.get_player(db, query.player_id)
    return transaction_repository.list_by_club(db, club_id, query.types, query.player_id)


def _summarize(rows: list[Transacao]) -> SummaryOut:
    zero = Decimal("0.00")
    sales = [row for row in rows if row.tipo == "VENDA"]
    return SummaryOut(
        total_spent=round_money(sum((r.valor + r.taxa for r in rows if r.tipo == "COMPRA"), zero)),
        total_received=round_money(sum((r.variacao_caixa for r in sales), zero)),
        total_fees=round_money(sum((r.taxa for r in rows), zero)),
        total_penalties=round_money(sum((r.multa for r in sales), zero)),
        total_profit=round_money(sum((r.lucro for r in sales), zero)),
    )
