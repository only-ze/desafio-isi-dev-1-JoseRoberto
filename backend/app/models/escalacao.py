from datetime import datetime
from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, timestamp

class Escalacao(Base):
    __tablename__ = "escalacoes"

    clube_id: Mapped[int] = mapped_column(ForeignKey("clubes.id"), primary_key=True)
    jogador_id: Mapped[int] = mapped_column(ForeignKey("jogadores.id"), primary_key=True, unique=True)
    criado_em: Mapped[datetime] = timestamp(server_default=func.now(), nullable=False)