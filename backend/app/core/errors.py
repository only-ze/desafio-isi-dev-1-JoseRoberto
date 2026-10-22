import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AppError(Exception):
    status_code = 500

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class BadRequestError(AppError):
    status_code = 400


class NotFoundError(AppError):
    status_code = 404


class BusinessRuleError(AppError):
    status_code = 409


def _error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"message": message})


def _describe_validation_error(exc: RequestValidationError) -> str:
    first = exc.errors()[0]
    message = first["msg"].removeprefix("Value error, ")
    field = ".".join(part for part in first["loc"] if isinstance(part, str) and part not in ("body", "query", "path"))
    return f"{field}: {message}" if field else message


async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
    return _error_response(exc.status_code, exc.message)


async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    return _error_response(400, _describe_validation_error(exc))


async def handle_http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _error_response(exc.status_code, str(exc.detail))


async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Erro inesperado", exc_info=exc)
    return _error_response(500, "Erro interno do servidor.")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, handle_app_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(StarletteHTTPException, handle_http_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
