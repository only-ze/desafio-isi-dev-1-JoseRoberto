from decimal import Decimal

from sqlalchemy import CheckConstraint, Index, Integer, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CriadoEmMixin


class Clube(CriadoEmMixin, Base):
    __tablename__ = "clubes"
    __table_args__ = (
        Index("uq_clubes_nome_lower", text("lower(nome)"), unique=True),
        CheckConstraint("formacao IN ('3-1','2-2','2-1-1','1-2-1')", name="ck_clubes_formacao"),
        CheckConstraint("caixa >= 0", name="ck_clubes_caixa"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(60), nullable=False)
    sigla: Mapped[str] = mapped_column(String(3), nullable=False, unique=True)
    caixa: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, default=Decimal("300.00"), server_default=text("300.00")
    )
    formacao: Mapped[str | None] = mapped_column(String(5), nullable=True)
    jogadores = relationship("Jogador", back_populates="clube")
