from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversaciones"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    pqr_id = Column(Integer, ForeignKey("pqr.id"), nullable=True, index=True)
    canal = Column(String(20), nullable=False, default="web")
    estado = Column(String(15), nullable=False, default="activa")
    titulo = Column(String(180), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    usuario = relationship("User", back_populates="conversaciones")
    mensajes = relationship("Message", back_populates="conversacion", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id", ondelete="CASCADE"), nullable=False, index=True)
    remitente = Column(String(15), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    contenido = Column(Text, nullable=False)
    proveedor_ia = Column(String(50), nullable=True)
    modelo_ia = Column(String(100), nullable=True)
    tokens_entrada = Column(Integer, nullable=True)
    tokens_salida = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), index=True)

    conversacion = relationship("Conversation", back_populates="mensajes")
    usuario = relationship("User", back_populates="mensajes")
