from fastapi import APIRouter

from app.api.routers.clubs import clubs
from app.api.routers.league import lineups, matches, standings
from app.api.routers.market import market
from app.api.routers.players import players

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(players.router)
api_router.include_router(clubs.router)
api_router.include_router(market.router)
api_router.include_router(matches.router)
api_router.include_router(lineups.router)
api_router.include_router(standings.router)
