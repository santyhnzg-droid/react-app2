from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.dependencies.auth import get_current_user
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    MeResponse,
    PasswordRecoveryRequest,
    PasswordResetRequest,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"],
)


def serialize_user(usuario: User):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "estado": usuario.estado,
        "rol_id": usuario.rol_id,
        "rol": usuario.rol.nombre if usuario.rol else None,
    }


def utcnow_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def token_hash(token: str):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Iniciar sesión",
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).lower().strip()

    usuario = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if usuario is None or not verify_password(
        data.password,
        usuario.password if usuario else "",
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos.",
        )

    if usuario.estado != "activo":
        raise HTTPException(
            status_code=403,
            detail="El usuario se encuentra inactivo.",
        )

    role_name = usuario.rol.nombre if usuario.rol else None

    token = create_access_token(
        {
            "sub": str(usuario.id),
            "rol": role_name,
        }
    )

    return {
        "ok": True,
        "message": "Inicio de sesión correcto.",
        "token": token,
        "usuario": serialize_user(usuario),
    }


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Obtener usuario autenticado",
)
def me(
    usuario: User = Depends(get_current_user),
):
    return {
        "ok": True,
        "usuario": {
            **serialize_user(usuario),
            "tipo_documento": usuario.tipo_documento,
            "numero_documento": usuario.numero_documento,
            "direccion": usuario.direccion,
            "telefono": usuario.telefono,
        },
    }


@router.post(
    "/recuperar-password",
    summary="Solicitar recuperación de contraseña",
)
def recover_password(
    data: PasswordRecoveryRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).lower().strip()

    usuario = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    generic_response = {
        "ok": True,
        "message": (
            "Si el correo está registrado, se generó un token "
            "temporal para restablecer la contraseña."
        ),
    }

    if usuario is None:
        return generic_response

    now = utcnow_naive()

    previous_tokens = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.usuario_id == usuario.id,
            PasswordResetToken.used_at.is_(None),
        )
        .all()
    )

    for previous in previous_tokens:
        previous.used_at = now

    plain_token = secrets.token_urlsafe(32)

    reset_token = PasswordResetToken(
        usuario_id=usuario.id,
        token_hash=token_hash(plain_token),
        expires_at=now + timedelta(minutes=15),
        used_at=None,
    )

    db.add(reset_token)
    db.commit()

    print(
        f"[PASSWORD RESET] {usuario.email} -> "
        f"token={plain_token} (expira en 15 minutos)"
    )

    response = dict(generic_response)

    if settings.APP_ENV.lower() == "development":
        response["reset_token"] = plain_token
        response["expires_in_minutes"] = 15

    return response


@router.post(
    "/restablecer-password",
    summary="Restablecer contraseña",
)
def reset_password(
    data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    now = utcnow_naive()

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash(data.token),
            PasswordResetToken.used_at.is_(None),
        )
        .first()
    )

    if reset_token is None:
        raise HTTPException(
            status_code=400,
            detail="Token inválido o ya utilizado.",
        )

    if reset_token.expires_at < now:
        reset_token.used_at = now
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="El token de recuperación ha expirado.",
        )

    usuario = (
        db.query(User)
        .filter(User.id == reset_token.usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado.",
        )

    usuario.password = hash_password(data.nueva_password)
    reset_token.used_at = now

    db.commit()

    return {
        "ok": True,
        "message": "Contraseña actualizada correctamente.",
    }
