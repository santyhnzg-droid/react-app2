from sqlalchemy import (
    Column,
    DateTime,
    String,
    Text,
    text,
)

from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    nombre = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    descripcion = Column(
        String(255),
        nullable=True,
    )

    usuarios = relationship(
        "User",
        back_populates="rol",
    )

    permisos = relationship(
        "Permission",
        secondary="rol_permisos",
        back_populates="roles",
    )
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
