import logging
from fastapi import FastAPI, Request

logger = logging.getLogger("app.http")

def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    ) 

def register_request_logging(app: FastAPI) -> None:
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        try:
            response = await call_next(request)
        except Exception:
            logger.error("%s %s %s", request.method, request.url.path, 500)
            raise
        logger.info("%s %s %s", request.method, request.url.path, response.status_code)
        return response