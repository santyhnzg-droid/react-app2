from sqlalchemy import (
    Column,
    Enum,
    String,
    Text,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categorias"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    nombre = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    descripcion = Column(
        Text,
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

    productos = relationship(
        "Product",
        back_populates="categoria",
    )