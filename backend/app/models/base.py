from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


def timestamp(**kwargs):
    return mapped_column(DateTime(timezone=True), **kwargs)


class CriadoEmMixin:
    criado_em: Mapped[datetime] = timestamp(server_default=func.now(), nullable=False)
