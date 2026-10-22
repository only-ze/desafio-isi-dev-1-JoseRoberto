from app.models import Transacao
from app.utils.location import BRT

HEADER = "data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa"


def _money(value) -> str:
    return f"{value:.2f}".replace(".", ",")


def _text(value: str) -> str:
    if ";" in value or '"' in value:
        return '"' + value.replace('"', '""') + '"'
    return value


def build_csv(transactions: list[Transacao]) -> str:
    lines = [HEADER]
    for t in transactions:
        lines.append(
            ";".join(
                [
                    t.criado_em.astimezone(BRT).isoformat(timespec="seconds"),
                    t.tipo,
                    _text(t.nome_jogador),
                    _money(t.valor),
                    _money(t.taxa),
                    _money(t.multa),
                    "" if t.lucro is None else _money(t.lucro),
                    _money(t.variacao_caixa),
                ]
            )
        )
    return "\n".join(lines) + "\n"
