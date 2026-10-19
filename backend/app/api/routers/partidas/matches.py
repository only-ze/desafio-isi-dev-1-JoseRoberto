from typing import Annotated
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.matches_schema import MatchCreate, MatchListQuery, MatchOut, MatchSummaryOut
from app.services import match_service
from app.api.deps import PathId
from app.utils.location import location_of

router = APIRouter(prefix="/matches", tags=["Partidas"])

@router.post("", response_model=MatchOut, status_code=201)
def play_match(data: MatchCreate, response: Response, db: Session = Depends(get_db)):
    match = match_service.play_match(db, data)
    response.headers["Location"] = location_of("matches", match.id)
    return match


@router.get("", response_model=list[MatchSummaryOut])
def list_matches(query: Annotated[MatchListQuery, Query()], db: Session = Depends(get_db)):
    return match_service.list_matches(db, query)


@router.get("/{id}", response_model=MatchOut)
def get_match(id: PathId, db: Session = Depends(get_db)):
    return match_service.get_match(db, id)