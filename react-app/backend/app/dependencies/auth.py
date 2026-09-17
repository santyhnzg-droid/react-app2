from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import (
    JWTError,
    jwt,
)

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User


bearer_scheme = HTTPBearer(
    auto_error=False
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(
        get_db
    ),
):
    if credentials is None:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Token requerido.",
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
        )

        user_id = payload.get(
            "sub"
        )

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Token inválido.",
            )

        user_id = int(
            user_id
        )

    except (
        JWTError,
        ValueError,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Token inválido o expirado."
            ),
        )

    usuario = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail=(
                "El usuario asociado al token no existe."
            ),
        )

    if (
        usuario.estado
        != "activo"
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "El usuario se encuentra inactivo."
            ),
        )

    return usuario


def require_roles(
    *roles: str
):
    def check_role(
        current_user: User = Depends(
            get_current_user
        ),
    ):
        role_name = (
            current_user.rol.nombre
            if current_user.rol
            else None
        )

        if (
            role_name
            not in roles
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "No tienes permisos para realizar esta acción."
                ),
            )

        return current_user

    return check_role