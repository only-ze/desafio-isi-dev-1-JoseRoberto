from typing import Annotated
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.api.deps import PathId
from app.utils.location import location_of
from app.db.database import get_db
from app.schemas.players_schema import PlayerCreate, PlayerListQuery, PlayerOut, PlayerPage
from app.services import player_service
from app.services.player_mapper import to_player_out

router = APIRouter(prefix="/players", tags=["Jogadores"])

@router.post("", response_model=PlayerOut, status_code=201)
def create_player(
    data: PlayerCreate,
    response: Response,
    db: Session = Depends(get_db),
):
    player = player_service.create_player(db, data)
    response.headers["Location"] = location_of("players", player.id)
    return to_player_out(player)

@router.get("", response_model=PlayerPage)
def list_players(
    query: Annotated[PlayerListQuery, Query()],
    db: Session = Depends(get_db),
):
    return player_service.list_players(db, query)

@router.get("/{id}", response_model=PlayerOut)
def get_player(id: PathId, db: Session = Depends(get_db)):
    return to_player_out(player_service.get_player(db, id))