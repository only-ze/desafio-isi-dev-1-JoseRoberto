from sqlalchemy import delete
from sqlalchemy.orm import Session
from app.models import Escalacao

def remove_player(db: Session, player_id: int) -> None:
    db.execute(delete(Escalacao).where(Escalacao.jogador_id == player_id))