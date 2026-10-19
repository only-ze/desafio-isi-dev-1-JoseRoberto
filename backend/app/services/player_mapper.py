from decimal import Decimal

from app.utils.player_value import calculate_market_value, calculate_overall
from app.models import Jogador
from app.schemas.players_schema import PlayerOut

def to_player_out(player: Jogador) -> PlayerOut:
    attributes = (player.velocidade, player.finalizacao, player.passe,
                  player.drible, player.defesa, player.fisico)
    return PlayerOut(
        id=player.id,
        name=player.nome,
        position=player.posicao,
        agility=player.agilidade,
        age=player.idade,
        condition=player.condicao,
        base_value=player.valor_base,
        market_value=calculate_market_value(
            player.valor_base, player.condicao, player.agilidade, player.idade
        ),
        pace=player.velocidade,
        shooting=player.finalizacao,
        passing=player.passe,
        dribbling=player.drible,
        defending=player.defesa,
        physical=player.fisico,
        potential=player.potencial,
        overall=calculate_overall(player.posicao, attributes),
        club_id=player.clube_id,
    )
    
def market_value_of(player: Jogador) -> Decimal:
    return calculate_market_value(
        player.valor_base, player.condicao, player.agilidade, player.idade
    )