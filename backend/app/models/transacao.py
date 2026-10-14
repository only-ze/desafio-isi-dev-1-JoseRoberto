from datetime import datetime
from decimal import Decimal
from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, timestamp

class Transacao(Base):
    __tablename__ = "transacoes"
    __table_args__ = (
        CheckConstraint("tipo IN ('COMPRA','VENDA')", name="ck_transacoes_tipo"),
        Index("ix_transacoes_clube_jogador", "clube_id", "jogador_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clube_id: Mapped[int] = mapped_column(ForeignKey("clubes.id"), nullable=False)
    jogador_id: Mapped[int] = mapped_column(ForeignKey("jogadores.id"), nullable=False)
    nome_jogador: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo: Mapped[str] = mapped_column(String(6), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    taxa: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    multa: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=Decimal("0.00"))
    lucro: Mapped[Decimal | None] = mapped_column(Numeric(7, 2), nullable=True)
    variacao_caixa: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    criado_em: Mapped[datetime] = timestamp(server_default=func.now(), nullable=False)