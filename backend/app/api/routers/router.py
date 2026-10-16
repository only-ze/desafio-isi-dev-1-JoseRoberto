from fastapi import APIRouter
from app.api.routers.jogadores import players

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(players.router)