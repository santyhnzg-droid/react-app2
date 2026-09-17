from sqlalchemy import (
    Column,
    ForeignKey,
    String,
    Table,
    Text,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


role_permission = Table(
    "rol_permisos",
    Base.metadata,

    Column(
        "rol_id",
        INTEGER(unsigned=True),
        ForeignKey(
            "roles.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    Column(
        "permiso_id",
        INTEGER(unsigned=True),
        ForeignKey(
            "permisos.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)


class Permission(Base):
    __tablename__ = "permisos"

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

    roles = relationship(
        "Role",
        secondary=role_permission,
        back_populates="permisos",
    )