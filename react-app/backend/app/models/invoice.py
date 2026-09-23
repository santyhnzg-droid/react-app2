from sqlalchemy import Column, DateTime, DECIMAL, Enum, ForeignKey, Integer, String, text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Invoice(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=False, unique=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    numero_factura = Column(String(30), nullable=False, unique=True, server_default=text("generar_numero_factura()"))
    fecha = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), index=True)
    subtotal = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(12, 2), nullable=False, default=0)
    total = Column(DECIMAL(12, 2), nullable=False)
    moneda = Column(String(3), nullable=False, default="COP")
    estado = Column(Enum("emitida", "pagada", "anulada", native_enum=False, length=20), nullable=False, default="emitida", index=True)
    cliente_nombre = Column(String(120), nullable=False)
    cliente_documento = Column(String(30), nullable=False)
    cliente_email = Column(String(120), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
    email_sent_at = Column(DateTime, nullable=True)

    venta = relationship("Sale", back_populates="factura")
    cliente = relationship("User", back_populates="facturas")
    detalles = relationship("InvoiceDetail", back_populates="factura", cascade="all, delete-orphan")


class InvoiceDetail(Base):
    __tablename__ = "detalle_facturas"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    factura_id = Column(Integer, ForeignKey("facturas.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True)
    tipo = Column(Enum("producto", "servicio", native_enum=False, length=10), nullable=False)
    descripcion = Column(String(255), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    subtotal = Column(DECIMAL(12, 2), nullable=False)

    factura = relationship("Invoice", back_populates="detalles")
    producto = relationship("Product")
    servicio = relationship("Service")
