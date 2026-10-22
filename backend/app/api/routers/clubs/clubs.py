from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import PathId
from app.db.database import get_db
from app.schemas.clubs_schema import ClubCreate, ClubDetailOut, ClubListQuery, ClubOut
from app.services import club_service
from app.utils.location import location_of

router = APIRouter(prefix="/clubs", tags=["Clubes"])


@router.post("", response_model=ClubOut, status_code=201)
def create_club(data: ClubCreate, response: Response, db: Session = Depends(get_db)):
    club = club_service.create_club(db, data)
    response.headers["Location"] = location_of("clubs", club.id)
    return club


@router.get("", response_model=list[ClubOut])
def list_clubs(query: Annotated[ClubListQuery, Query()], db: Session = Depends(get_db)):
    return club_service.list_clubs(db, query)


@router.get("/{id}", response_model=ClubDetailOut)
def get_club(id: PathId, db: Session = Depends(get_db)):
    return club_service.get_club(db, id)
