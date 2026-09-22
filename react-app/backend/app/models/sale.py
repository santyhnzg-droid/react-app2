from sqlalchemy import Column, DateTime, DECIMAL, Enum, ForeignKey, Integer, Text, String, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Sale(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    subtotal = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(12, 2), nullable=False, default=0)
    total = Column(DECIMAL(12, 2), nullable=False)
    moneda = Column(String(3), nullable=False, default="COP")
    estado = Column(Enum("pendiente", "pagada", "cancelada", "reembolsada", native_enum=False, length=20), nullable=False, default="pendiente", index=True)
    origen = Column(Enum("web", "empleado", "admin", "legacy", native_enum=False, length=20), nullable=False, default="web")
    fecha = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), index=True)
    observaciones = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    cliente = relationship("User", foreign_keys=[cliente_id], back_populates="ventas_como_cliente")
    usuario = relationship("User", foreign_keys=[usuario_id], back_populates="ventas_registradas")
    detalles = relationship("SaleDetail", back_populates="venta", cascade="all, delete-orphan")
    factura = relationship("Invoice", back_populates="venta", uselist=False)
    pagos = relationship("Payment", back_populates="venta")


class SaleDetail(Base):
    __tablename__ = "detalle_ventas"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True, index=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True, index=True)
    tipo = Column(Enum("producto", "servicio", native_enum=False, length=10), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    subtotal = Column(DECIMAL(12, 2), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))

    venta = relationship("Sale", back_populates="detalles")
    producto = relationship("Product")
    servicio = relationship("Service")
