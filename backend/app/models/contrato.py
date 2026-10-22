from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, timestamp


class Contrato(Base):
    __tablename__ = "contratos"
    __table_args__ = (
        CheckConstraint("situacao IN ('ATIVO','ENCERRADO','RESCINDIDO')", name="ck_contratos_situacao"),
        Index(
            "uq_contratos_jogador_ativo",
            "jogador_id",
            unique=True,
            postgresql_where=text("situacao = 'ATIVO'"),
        ),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    jogador_id: Mapped[int] = mapped_column(ForeignKey("jogadores.id"), nullable=False)
    clube_id: Mapped[int] = mapped_column(ForeignKey("clubes.id"), nullable=False, index=True)
    valor_compra: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    fidelidade_ate: Mapped[datetime] = timestamp(nullable=False)
    situacao: Mapped[str] = mapped_column(String(12), nullable=False, default="ATIVO")
    iniciado_em: Mapped[datetime] = timestamp(nullable=False)
    encerrado_em: Mapped[datetime | None] = timestamp(nullable=True)
