from sqlalchemy import Column, DateTime, DECIMAL, Enum, ForeignKey, String, text
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.orm import relationship

from app.core.database import Base


class Payment(Base):
    __tablename__ = "pagos"

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True, index=True)
    usuario_id = Column(INTEGER(unsigned=True), ForeignKey("usuarios.id"), nullable=False, index=True)
    producto_id = Column(INTEGER(unsigned=True), ForeignKey("productos.id"), nullable=False, index=True)
    stripe_session_id = Column(String(255), unique=True, nullable=False, index=True)
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=True, index=True)
    monto = Column(DECIMAL(12, 2), nullable=False)
    moneda = Column(String(3), nullable=False, default="cop")
    estado = Column(Enum("PENDING", "APPROVED", "FAILED", "CANCELLED"), nullable=False, default="PENDING")
    cantidad = Column(INTEGER(unsigned=True), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    usuario = relationship("User")
    producto = relationship("Product")
    items = relationship("PaymentItem", back_populates="payment", cascade="all, delete-orphan")


class PaymentItem(Base):
    __tablename__ = "detalle_pagos"

    id = Column(INTEGER(unsigned=True), primary_key=True, autoincrement=True, index=True)
    payment_id = Column(INTEGER(unsigned=True), ForeignKey("pagos.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(INTEGER(unsigned=True), ForeignKey("productos.id"), nullable=False, index=True)
    cantidad = Column(INTEGER(unsigned=True), nullable=False)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False)

    payment = relationship("Payment", back_populates="items")
    producto = relationship("Product")
