from sqlalchemy.orm import Session
from app.utils.player_value import calculate_base_value, calculate_overall
from app.models import Jogador
from app.repositories import player_repository
from app.schemas.players_schema import PlayerCreate

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