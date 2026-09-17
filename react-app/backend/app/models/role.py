from sqlalchemy import (
    Column,
    String,
    Text,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(
        INTEGER(unsigned=True),
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
        Text,
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