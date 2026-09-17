from sqlalchemy import (
    Column,
    DateTime,
    DECIMAL,
    ForeignKey,
    text,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Sale(Base):
    __tablename__ = "ventas"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    usuario_id = Column(
        INTEGER(unsigned=True),
        ForeignKey(
            "usuarios.id"
        ),
        nullable=False,
        index=True,
    )

    total = Column(
        DECIMAL(12, 2),
        nullable=False,
    )

    fecha = Column(
        DateTime,
        nullable=False,
        server_default=text(
            "CURRENT_TIMESTAMP"
        ),
    )

    detalles = relationship(
        "SaleDetail",
        back_populates="venta",
        cascade=(
            "all, delete-orphan"
        ),
    )


class SaleDetail(Base):
    __tablename__ = "detalle_ventas"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    venta_id = Column(
        INTEGER(unsigned=True),
        ForeignKey(
            "ventas.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    producto_id = Column(
        INTEGER(unsigned=True),
        ForeignKey(
            "productos.id"
        ),
        nullable=False,
        index=True,
    )

    cantidad = Column(
        INTEGER(unsigned=True),
        nullable=False,
    )

    precio_unitario = Column(
        DECIMAL(12, 2),
        nullable=False,
    )

    venta = relationship(
        "Sale",
        back_populates="detalles",
    )