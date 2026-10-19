from fastapi import APIRouter
from app.api.routers.jogadores import players
from app.api.routers.clubes import clubs
from app.api.routers.mercado import market

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(players.router)
api_router.include_router(clubs.router)
api_router.include_router(market.router)