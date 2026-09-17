from sqlalchemy import (
    Column,
    DECIMAL,
    Enum,
    String,
    Text,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from app.core.database import Base


class Service(Base):
    __tablename__ = "servicios"

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

    estado = Column(
        Enum(
            "activo",
            "inactivo",
        ),
        default="activo",
        nullable=False,
    )