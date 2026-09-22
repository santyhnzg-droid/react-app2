from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
)

from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.core.database import Base


class PasswordResetToken(Base):
    __tablename__ = (
        "password_reset_tokens"
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    usuario_id = Column(
        Integer,
        ForeignKey(
            "usuarios.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    token_hash = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    expires_at = Column(
        DateTime,
        nullable=False,
    )

    used_at = Column(
        DateTime,
        nullable=True,
    )

    usuario = relationship(
        "User"
    )
