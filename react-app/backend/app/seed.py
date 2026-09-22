from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password

import app.models

from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User


ROLES = {
    "Administrador": "Acceso completo a la administración de GameZone.",
    "Empleado": "Acceso a funciones operativas y registro de ventas.",
    "Cliente": "Acceso a las funcionalidades del cliente.",
}

PERMISSIONS = {
    "gestionar_usuarios": "Crear, listar, editar, cambiar estado y eliminar usuarios.",
    "gestionar_productos": "Crear, listar, editar y eliminar productos.",
    "gestionar_servicios": "Crear, listar, editar y eliminar servicios.",
    "registrar_ventas": "Registrar ventas y descontar stock.",
}

ROLE_PERMISSIONS = {
    "Administrador": {
        "gestionar_usuarios",
        "gestionar_productos",
        "gestionar_servicios",
        "registrar_ventas",
    },
    "Empleado": {
        "registrar_ventas",
    },
    "Cliente": set(),
}


def create_tables():
    Base.metadata.create_all(bind=engine)

    # Las ventas de mostrador pueden registrarse sin asociar un cliente.
    # Algunas bases creadas con una versión anterior tenían una restricción
    # que obligaba a informar `cliente_id`, aunque el modelo actual lo deja
    # opcional. Corrige esa diferencia de esquema de forma idempotente.
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE ventas "
                "DROP CONSTRAINT IF EXISTS ck_ventas_cliente_requerido"
            )
        )


def seed_roles(db):
    result = {}

    for nombre, descripcion in ROLES.items():
        role = (
            db.query(Role)
            .filter(Role.nombre == nombre)
            .first()
        )

        if role is None:
            role = Role(
                nombre=nombre,
                descripcion=descripcion,
            )
            db.add(role)
            db.flush()
            print(f"[SEED] Rol creado: {nombre}")

        result[nombre] = role

    return result


def seed_permissions(db):
    result = {}

    for nombre, descripcion in PERMISSIONS.items():
        permission = (
            db.query(Permission)
            .filter(Permission.nombre == nombre)
            .first()
        )

        if permission is None:
            permission = Permission(
                nombre=nombre,
                descripcion=descripcion,
            )
            db.add(permission)
            db.flush()
            print(f"[SEED] Permiso creado: {nombre}")

        result[nombre] = permission

    return result


def seed_role_permissions(roles, permissions):
    for role_name, permission_names in ROLE_PERMISSIONS.items():
        role = roles[role_name]

        desired_permissions = [
            permissions[name]
            for name in permission_names
        ]

        current_ids = {
            permission.id
            for permission in role.permisos
        }

        for permission in desired_permissions:
            if permission.id not in current_ids:
                role.permisos.append(permission)

        print(
            f"[SEED] Permisos verificados para rol: {role_name}"
        )


def seed_admin(db, roles):
    admin_role = roles["Administrador"]

    admin = (
        db.query(User)
        .filter(
            User.email == settings.INITIAL_ADMIN_EMAIL.lower().strip()
        )
        .first()
    )

    if admin is not None:
        changed = False

        if admin.rol_id != admin_role.id:
            admin.rol_id = admin_role.id
            changed = True

        if admin.estado != "activo":
            admin.estado = "activo"
            changed = True

        print(
            "[SEED] Administrador actualizado."
            if changed
            else "[SEED] Administrador ya existe."
        )
        return admin

    document_exists = (
        db.query(User)
        .filter(
            User.numero_documento
            == settings.INITIAL_ADMIN_DOCUMENT
        )
        .first()
    )

    if document_exists:
        raise RuntimeError(
            "INITIAL_ADMIN_DOCUMENT ya pertenece a otro usuario."
        )

    admin = User(
        nombre="Administrador",
        apellido="GameZone",
        tipo_documento="CC",
        numero_documento=settings.INITIAL_ADMIN_DOCUMENT,
        direccion="Administración GameZone",
        telefono="3000000000",
        email=settings.INITIAL_ADMIN_EMAIL.lower().strip(),
        password=hash_password(
            settings.INITIAL_ADMIN_PASSWORD
        ),
        rol_id=admin_role.id,
        estado="activo",
    )

    db.add(admin)
    print(
        "[SEED] Administrador creado: "
        f"{settings.INITIAL_ADMIN_EMAIL}"
    )

    return admin


def seed_initial_data():
    create_tables()
    db = SessionLocal()

    try:
        roles = seed_roles(db)
        permissions = seed_permissions(db)
        seed_role_permissions(roles, permissions)
        seed_admin(db, roles)

        db.commit()

        print(
            "[SEED] Datos iniciales verificados correctamente."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_initial_data()
