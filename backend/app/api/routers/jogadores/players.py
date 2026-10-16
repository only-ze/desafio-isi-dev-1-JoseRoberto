from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.schemas.players_schema import PlayerCreate, PlayerOut
from app.db.database import get_db
from app.services import player_service
from app.utils.location import location_of
from app.services.player_mapper import to_player_out

router = APIRouter(prefix="/players", tags=["Jogadores"])

@router.post("", response_model=PlayerOut, status_code=201)
def create_player(
    data: PlayerCreate,
    response: Response,
    db: Session = Depends(get_db),
) -> PlayerOut:
    player = player_service.create_player(db, data)
    response.headers["Location"] = location_of("players", player.id)
    return to_player_out(player)
