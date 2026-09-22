from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Table,
    Text,
    text,
)

from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.core.database import Base


role_permission = Table(
    "rol_permisos",
    Base.metadata,

    Column(
        "rol_id",
        Integer,
        ForeignKey(
            "roles.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    Column(
        "permiso_id",
        Integer,
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
        Integer,
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
        String(255),
        nullable=True,
    )
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))

    roles = relationship(
        "Role",
        secondary=role_permission,
        back_populates="permisos",
    )
