from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class PQR(Base):
    __tablename__ = "pqr"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    asignado_a = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    tipo = Column(String(20), nullable=False)
    asunto = Column(String(180), nullable=False)
    descripcion = Column(Text, nullable=False)
    estado = Column(Enum("pendiente", "en_proceso", "respondida", "cerrada", native_enum=False, length=20), nullable=False, default="pendiente", index=True)
    prioridad = Column(String(10), nullable=False, default="media")
    fecha_cierre = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), index=True)
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    cliente = relationship("User", foreign_keys=[cliente_id], back_populates="pqr")
    asignado = relationship("User", foreign_keys=[asignado_a], back_populates="pqr_asignadas")
    respuestas = relationship("PQRResponse", back_populates="pqr", cascade="all, delete-orphan")


class PQRResponse(Base):
    __tablename__ = "pqr_respuestas"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    pqr_id = Column(Integer, ForeignKey("pqr.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    mensaje = Column(Text, nullable=False)
    es_interna = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))

    pqr = relationship("PQR", back_populates="respuestas")
    usuario = relationship("User")
