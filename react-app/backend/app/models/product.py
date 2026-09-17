from sqlalchemy import (
    Column,
    DECIMAL,
    Enum,
    ForeignKey,
    String,
    Text,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "productos"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    nombre = Column(
        String(120),
        nullable=False,
    )

    descripcion = Column(
        Text,
        nullable=True,
    )

    precio = Column(
        DECIMAL(12, 2),
        nullable=False,
    )

    stock = Column(
        INTEGER(unsigned=True),
        default=0,
        nullable=False,
    )

    imagen = Column(
        String(255),
        nullable=True,
    )

    categoria_id = Column(
        INTEGER(unsigned=True),
        ForeignKey(
            "categorias.id"
        ),
        nullable=True,
    )

    estado = Column(
        Enum(
            "activo",
            "inactivo",
        ),
        default="activo",
        nullable=False,
    )

    categoria = relationship(
        "Category",
        back_populates="productos",
    )