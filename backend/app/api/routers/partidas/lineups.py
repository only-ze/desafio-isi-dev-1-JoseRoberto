from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import PathId
from app.db.database import get_db
from app.schemas.lineups_schema import LineupOut, LineupUpdate
from app.services import lineup_service

router = APIRouter(tags=["Escalação"])

@router.put("/clubs/{id}/lineup", response_model=LineupOut)
def set_lineup(id: PathId, data: LineupUpdate, db: Session = Depends(get_db)):
    return lineup_service.set_lineup(db, id, data)

@router.get("/clubs/{id}/lineup", response_model=LineupOut)
def get_lineup(id: PathId, db: Session = Depends(get_db)):
    return lineup_service.get_lineup(db, id)