from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CriadoEmMixin, timestamp


class Jogador(CriadoEmMixin, Base):
    __tablename__ = "jogadores"
    __table_args__ = (
        CheckConstraint("posicao IN ('GOL','ZAG','LAT','MEI','ATA')", name="ck_jogadores_posicao"),
        CheckConstraint("condicao IN ('APTO','MAL_CONDICIONADO','DOENTE')", name="ck_jogadores_condicao"),
        CheckConstraint("agilidade BETWEEN 1 AND 100", name="ck_jogadores_agilidade"),
        CheckConstraint("idade BETWEEN 16 AND 45", name="ck_jogadores_idade"),
        CheckConstraint(
            "velocidade BETWEEN 1 AND 99 AND finalizacao BETWEEN 1 AND 99 AND passe BETWEEN 1 AND 99 "
            "AND drible BETWEEN 1 AND 99 AND defesa BETWEEN 1 AND 99 AND fisico BETWEEN 1 AND 99",
            name="ck_jogadores_atributos",
        ),
        CheckConstraint("potencial BETWEEN 1 AND 99", name="ck_jogadores_potencial"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    posicao: Mapped[str] = mapped_column(String(3), nullable=False)
    agilidade: Mapped[int] = mapped_column(nullable=False)
    idade: Mapped[int] = mapped_column(nullable=False)
    valor_base: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    condicao: Mapped[str] = mapped_column(String(20), nullable=False, default="APTO")
    clube_id: Mapped[int | None] = mapped_column(ForeignKey("clubes.id"), nullable=True, index=True)
    velocidade: Mapped[int] = mapped_column(nullable=False)
    finalizacao: Mapped[int] = mapped_column(nullable=False)
    passe: Mapped[int] = mapped_column(nullable=False)
    drible: Mapped[int] = mapped_column(nullable=False)
    defesa: Mapped[int] = mapped_column(nullable=False)
    fisico: Mapped[int] = mapped_column(nullable=False)
    potencial: Mapped[int] = mapped_column(nullable=False)
    excluido_em: Mapped[datetime | None] = timestamp(nullable=True)
    atualizado_em: Mapped[datetime] = timestamp(server_default=func.now(), onupdate=func.now(), nullable=False)
    clube = relationship("Clube", back_populates="jogadores")
