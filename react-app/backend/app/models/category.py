from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    String,
    Text,
    text,
)

from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categorias"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    nombre = Column(
        String(80),
        unique=True,
        nullable=False,
    )

    descripcion = Column(
        String(255),
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

    productos = relationship(
        "Product",
        back_populates="categoria",
    )
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
