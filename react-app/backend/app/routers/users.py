from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import or_

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.security import (
    hash_password,
)

from app.dependencies.auth import (
    require_roles,
)

from app.models.role import Role
from app.models.user import User

from app.schemas.user import (
    UserCreateAdmin,
    UserRegister,
    UserStateUpdate,
    UserUpdate,
)


router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"],
)


def serialize_user(
    usuario: User
):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "tipo_documento": (
            usuario.tipo_documento
        ),
        "numero_documento": (
            usuario.numero_documento
        ),
        "direccion": usuario.direccion,
        "telefono": usuario.telefono,
        "email": usuario.email,
        "estado": usuario.estado,
        "rol_id": usuario.rol_id,
        "rol": (
            usuario.rol.nombre
            if usuario.rol
            else None
        ),
    }


@router.post(
    "/registro",
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def register_client(
    data: UserRegister,
    db: Session = Depends(
        get_db
    ),
):
    email = str(
        data.email
    ).lower().strip()

    duplicate = (
        db.query(User)
        .filter(
            or_(
                User.email == email,
                User.numero_documento
                == data.numero_documento,
            )
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=(
                "El correo o documento ya se encuentra registrado."
            ),
        )

    client_role = (
        db.query(Role)
        .filter(
            Role.nombre
            == "Cliente"
        )
        .first()
    )

    if client_role is None:
        raise HTTPException(
            status_code=500,
            detail=(
                "No existe el rol Cliente en la base de datos."
            ),
        )

    usuario = User(
        nombre=data.nombre.strip(),
        apellido=data.apellido.strip(),
        tipo_documento=(
            data.tipo_documento
        ),
        numero_documento=(
            data.numero_documento
        ),
        direccion=(
            data.direccion.strip()
        ),
        telefono=data.telefono,
        email=email,
        password=hash_password(
            data.password
        ),
        rol_id=client_role.id,
        estado="activo",
    )

    db.add(
        usuario
    )

    db.commit()

    db.refresh(
        usuario
    )

    return {
        "ok": True,
        "message": (
            "Usuario registrado correctamente."
        ),
        "usuario": serialize_user(
            usuario
        ),
    }


@router.get("")
def get_users(
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    usuarios = (
        db.query(User)
        .order_by(
            User.id.desc()
        )
        .all()
    )

    return {
        "ok": True,
        "usuarios": [
            serialize_user(
                usuario
            )
            for usuario
            in usuarios
        ],
    }


@router.get(
    "/{user_id}"
)
def get_user(
    user_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    usuario = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Usuario no encontrado."
            ),
        )

    return {
        "ok": True,
        "usuario": serialize_user(
            usuario
        ),
    }


@router.post(
    "",
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def create_user(
    data: UserCreateAdmin,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    email = str(
        data.email
    ).lower().strip()

    duplicate = (
        db.query(User)
        .filter(
            or_(
                User.email == email,
                User.numero_documento
                == data.numero_documento,
            )
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=(
                "El correo o documento ya está registrado."
            ),
        )

    role = (
        db.query(Role)
        .filter(
            Role.id == data.rol_id
        )
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=400,
            detail="Rol inválido.",
        )

    usuario = User(
        nombre=data.nombre.strip(),
        apellido=data.apellido.strip(),
        tipo_documento=(
            data.tipo_documento
        ),
        numero_documento=(
            data.numero_documento
        ),
        direccion=(
            data.direccion.strip()
        ),
        telefono=data.telefono,
        email=email,
        password=hash_password(
            data.password
        ),
        rol_id=data.rol_id,
        estado="activo",
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {
        "ok": True,
        "message": (
            "Usuario creado correctamente."
        ),
        "usuario": serialize_user(
            usuario
        ),
    }


@router.put(
    "/{user_id}"
)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    usuario = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Usuario no encontrado."
            ),
        )

    duplicate = (
        db.query(User)
        .filter(
            User.id != user_id,
            or_(
                User.email
                == str(
                    data.email
                ).lower().strip(),
                User.numero_documento
                == data.numero_documento,
            ),
        )
        .first()
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=(
                "El correo o documento pertenece a otro usuario."
            ),
        )

    role = (
        db.query(Role)
        .filter(
            Role.id
            == data.rol_id
        )
        .first()
    )

    if role is None:
        raise HTTPException(
            status_code=400,
            detail="Rol inválido.",
        )

    usuario.nombre = (
        data.nombre.strip()
    )

    usuario.apellido = (
        data.apellido.strip()
    )

    usuario.tipo_documento = (
        data.tipo_documento
    )

    usuario.numero_documento = (
        data.numero_documento
    )

    usuario.direccion = (
        data.direccion.strip()
    )

    usuario.telefono = (
        data.telefono
    )

    usuario.email = str(
        data.email
    ).lower().strip()

    usuario.rol_id = (
        data.rol_id
    )

    if data.password:
        usuario.password = (
            hash_password(
                data.password
            )
        )

    db.commit()
    db.refresh(usuario)

    return {
        "ok": True,
        "message": (
            "Usuario actualizado correctamente."
        ),
        "usuario": serialize_user(
            usuario
        ),
    }


@router.patch(
    "/{user_id}/estado"
)
def change_user_state(
    user_id: int,
    data: UserStateUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    usuario = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Usuario no encontrado."
            ),
        )

    if (
        usuario.id
        == current_user.id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "No puedes cambiar el estado de tu propia cuenta."
            ),
        )

    usuario.estado = (
        data.estado
    )

    db.commit()

    return {
        "ok": True,
        "message": (
            "Estado actualizado correctamente."
        ),
    }


@router.delete(
    "/{user_id}"
)
def delete_user(
    user_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    usuario = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Usuario no encontrado."
            ),
        )

    if (
        usuario.id
        == current_user.id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "No puedes eliminar tu propia cuenta."
            ),
        )

    db.delete(usuario)
    db.commit()

    return {
        "ok": True,
        "message": (
            "Usuario eliminado correctamente."
        ),
    }