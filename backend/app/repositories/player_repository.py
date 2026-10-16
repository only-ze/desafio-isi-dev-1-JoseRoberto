from sqlalchemy.orm import Session
from app.models import Jogador

def add(db: Session, player: Jogador) -> Jogador:
    db.add(player)
    db.flush()
    return player