from sqlalchemy import Column, DateTime, DECIMAL, Enum, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Payment(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True, index=True)
    cantidad = Column(Integer, nullable=True)
    proveedor = Column(String(20), nullable=False, default="stripe")
    metodo_pago = Column(String(30), nullable=True)
    stripe_session_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=True, index=True)
    referencia_externa = Column(String(255), nullable=True)
    monto = Column(DECIMAL(12, 2), nullable=False)
    moneda = Column(String(3), nullable=False, default="COP")
    estado = Column(Enum("PENDING", "APPROVED", "FAILED", "CANCELLED", native_enum=False, length=20), nullable=False, default="PENDING")
    mensaje_error = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), index=True)
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    usuario = relationship("User", back_populates="pagos")
    venta = relationship("Sale", back_populates="pagos")
    producto = relationship("Product")
    items = relationship("PaymentItem", back_populates="payment", cascade="all, delete-orphan")


class PaymentItem(Base):
    __tablename__ = "detalle_pagos"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    payment_id = Column(Integer, ForeignKey("pagos.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True, index=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True, index=True)
    tipo = Column(Enum("producto", "servicio", native_enum=False, length=10), nullable=False, default="producto")
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False)

    payment = relationship("Payment", back_populates="items")
    producto = relationship("Product")
    servicio = relationship("Service")
