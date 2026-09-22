from sqlalchemy import (
    Column,
    DateTime,
    DECIMAL,
    Enum,
    String,
    Text,
    text,
)

from sqlalchemy import Integer

from app.core.database import Base


class Service(Base):
    __tablename__ = "servicios"

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
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
