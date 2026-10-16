from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.api.routers.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(title="Passe API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.cors_origin],
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Location", "Content-Disposition"],
    )
    app.include_router(api_router)
    register_error_handlers(app)
    return app

app = create_app()

@app.get("/")
async def root():
    return {"Api do desafio isi-dev-1-JoseRoberto": "Bem-vindo!"}