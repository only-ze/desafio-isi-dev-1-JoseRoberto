from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import PathId
from app.db.database import get_db
from app.schemas.market_schema import (
    BuyOut,
    BuyRequest,
    SellOut,
    TransactionListOut,
    TransactionQuery,
)
from app.services import market_service

router = APIRouter(tags=["Mercado"])


@router.post("/players/{id}/buy", response_model=BuyOut)
def buy_player(id: PathId, data: BuyRequest, db: Session = Depends(get_db)):
    return market_service.buy_player(db, id, data)


@router.post("/players/{id}/sell", response_model=SellOut)
def sell_player(id: PathId, db: Session = Depends(get_db)):
    return market_service.sell_player(db, id)


@router.get("/clubs/{id}/transactions", response_model=TransactionListOut)
def list_transactions(id: PathId, query: Annotated[TransactionQuery, Query()], db: Session = Depends(get_db)):
    return market_service.list_transactions(db, id, query)


@router.get("/clubs/{id}/transactions/export")
def export_transactions(id: PathId, query: Annotated[TransactionQuery, Query()], db: Session = Depends(get_db)):
    content = market_service.export_transactions(db, id, query)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="transacoes.csv"'},
    )
