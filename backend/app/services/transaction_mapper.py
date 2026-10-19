from app.models import Transacao
from app.schemas.market_schema import TransactionOut

def to_transaction_out(transaction: Transacao) -> TransactionOut:
    return TransactionOut(
        id=transaction.id,
        club_id=transaction.clube_id,
        player_id=transaction.jogador_id,
        player_name=transaction.nome_jogador,
        type=transaction.tipo,
        value=transaction.valor,
        fee=transaction.taxa,
        penalty=transaction.multa,
        profit=transaction.lucro,
        cash_change=transaction.variacao_caixa,
        created_at=transaction.criado_em,
    )