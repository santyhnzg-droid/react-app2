from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
)

from sqlalchemy.dialects.mysql import (
    INTEGER,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class PasswordResetToken(Base):
    __tablename__ = (
        "password_reset_tokens"
    )

    id = Column(
        INTEGER(unsigned=True),
        primary_key=True,
        autoincrement=True,
        index=True,
    )

    usuario_id = Column(
        INTEGER(unsigned=True),
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