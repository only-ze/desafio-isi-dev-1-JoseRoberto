from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.matches_schema import StandingOut
from app.services import standings_service

router = APIRouter(tags=["Classificação"])


@router.get("/standings", response_model=list[StandingOut])
def get_standings(db: Session = Depends(get_db)):
    return standings_service.get_standings(db)
