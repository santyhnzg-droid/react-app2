from sqlalchemy import (
    Column,
    DateTime,
    DECIMAL,
    Enum,
    ForeignKey,
    String,
    Text,
    text,
)

from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "productos"

    id = Column(
        Integer,
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
        Integer,
        default=0,
        nullable=False,
    )

    imagen = Column(
        String(255),
        nullable=True,
    )

    categoria_id = Column(
        Integer,
        ForeignKey(
            "categorias.id"
        ),
        nullable=True,
    )

    estado = Column(
        Enum(
            "activo",
            "inactivo",
            native_enum=False,
            length=10,
        ),
        default="activo",
        nullable=False,
    )

    categoria = relationship(
        "Category",
        back_populates="productos",
    )
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
