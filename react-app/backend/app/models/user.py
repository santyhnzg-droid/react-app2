from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
)
from sqlalchemy.dialects.mysql import (
    INTEGER,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
class User(Base):
    __tablename__ = "usuarios"

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    nombre = Column(
        String(50),
        nullable=False,
    )

    apellido = Column(
        String(50),
        nullable=False,
    )

    tipo_documento = Column(
        String(20),
        nullable=False,
    )

    numero_documento = Column(
        String(30),
        unique=True,
        nullable=False,
    )

    direccion = Column(
        String(255),
        nullable=False,
    )

    telefono = Column(
        String(30),
        nullable=False,
    )

    email = Column(
        String(120),
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(
        String(255),
        nullable=False,
    )

    rol_id = Column(
        INTEGER(unsigned=True),
        ForeignKey("roles.id"),
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

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )

    rol = relationship(
        "Role",
        back_populates="usuarios",
    )