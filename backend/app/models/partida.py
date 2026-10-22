from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, timestamp

FORMACOES = "('3-1','2-2','2-1-1','1-2-1')"


class Partida(Base):
    __tablename__ = "partidas"
    __table_args__ = (
        CheckConstraint("mandante_id <> visitante_id", name="ck_partidas_clubes_distintos"),
        CheckConstraint("gols_mandante BETWEEN 0 AND 3", name="ck_partidas_gols_mandante"),
        CheckConstraint("gols_visitante BETWEEN 0 AND 3", name="ck_partidas_gols_visitante"),
        CheckConstraint(f"formacao_mandante IN {FORMACOES}", name="ck_partidas_formacao_mandante"),
        CheckConstraint(f"formacao_visitante IN {FORMACOES}", name="ck_partidas_formacao_visitante"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mandante_id: Mapped[int] = mapped_column(ForeignKey("clubes.id"), nullable=False, index=True)
    visitante_id: Mapped[int] = mapped_column(ForeignKey("clubes.id"), nullable=False, index=True)
    gols_mandante: Mapped[int] = mapped_column(nullable=False)
    gols_visitante: Mapped[int] = mapped_column(nullable=False)
    formacao_mandante: Mapped[str] = mapped_column(String(5), nullable=False)
    formacao_visitante: Mapped[str] = mapped_column(String(5), nullable=False)
    jogada_em: Mapped[datetime] = timestamp(nullable=False)

    duelos = relationship("DueloPartida", back_populates="partida", order_by="DueloPartida.ordem")


class DueloPartida(Base):
    __tablename__ = "duelos_partida"
    __table_args__ = (
        UniqueConstraint("partida_id", "ordem", name="uq_duelos_partida_ordem"),
        CheckConstraint("ordem BETWEEN 1 AND 6", name="ck_duelos_ordem"),
        CheckConstraint("condicao_atacante IN ('APTO','MAL_CONDICIONADO')", name="ck_duelos_cond_atacante"),
        CheckConstraint("condicao_defensor IN ('APTO','MAL_CONDICIONADO')", name="ck_duelos_cond_defensor"),
        CheckConstraint("atributo_ataque IN ('shooting','passing','dribbling')", name="ck_duelos_atributo_ataque"),
        CheckConstraint("atributo_defesa = 'defending'", name="ck_duelos_atributo_defesa"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    partida_id: Mapped[int] = mapped_column(ForeignKey("partidas.id"), nullable=False)
    ordem: Mapped[int] = mapped_column(nullable=False)
    clube_atacante_id: Mapped[int] = mapped_column(ForeignKey("clubes.id"), nullable=False)
    atacante_id: Mapped[int] = mapped_column(ForeignKey("jogadores.id"), nullable=False)
    defensor_id: Mapped[int] = mapped_column(ForeignKey("jogadores.id"), nullable=False)
    nome_atacante: Mapped[str] = mapped_column(String(100), nullable=False)
    nome_defensor: Mapped[str] = mapped_column(String(100), nullable=False)
    posicao_atacante: Mapped[str] = mapped_column(String(3), nullable=False)
    posicao_defensor: Mapped[str] = mapped_column(String(3), nullable=False)
    condicao_atacante: Mapped[str] = mapped_column(String(20), nullable=False)
    condicao_defensor: Mapped[str] = mapped_column(String(20), nullable=False)
    atributo_ataque: Mapped[str] = mapped_column(String(10), nullable=False)
    atributo_defesa: Mapped[str] = mapped_column(String(10), nullable=False)
    valor_ataque: Mapped[int] = mapped_column(nullable=False)
    valor_defesa: Mapped[int] = mapped_column(nullable=False)
    gol: Mapped[bool] = mapped_column(Boolean, nullable=False)

    partida = relationship("Partida", back_populates="duelos")
