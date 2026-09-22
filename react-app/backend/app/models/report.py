from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class GeneratedReport(Base):
    __tablename__ = "reportes_generados"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    tipo = Column(String(30), nullable=False, default="ventas_diarias")
    formato = Column(String(10), nullable=False)
    fecha_inicial = Column(Date, nullable=True)
    fecha_final = Column(Date, nullable=True)
    filtros = Column(JSONB, nullable=False, default=dict)
    nombre_archivo = Column(String(255), nullable=True)
    ruta_archivo = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), index=True)

    usuario = relationship("User", back_populates="reportes_generados")
