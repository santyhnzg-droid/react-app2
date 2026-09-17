from datetime import (
    datetime,
    timedelta,
    timezone,
)

import bcrypt

from jose import jwt

from app.core.config import settings


def hash_password(
    password: str
) -> str:
    password_bytes = password.encode(
        "utf-8"
    )

    salt = bcrypt.gensalt(
        rounds=12
    )

    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed.decode(
        "utf-8"
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode(
                "utf-8"
            ),
            hashed_password.encode(
                "utf-8"
            ),
        )

    except (
        ValueError,
        TypeError,
    ):
        return False


def create_access_token(
    data: dict
) -> str:
    payload = data.copy()

    expiration = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            minutes=(
                settings.JWT_EXPIRE_MINUTES
            )
        )
    )

    payload["exp"] = expiration

    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=(
            settings.JWT_ALGORITHM
        ),
    )