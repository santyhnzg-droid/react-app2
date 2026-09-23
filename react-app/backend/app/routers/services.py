from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.dependencies.auth import (
    require_roles,
)

from app.models.service import Service
from app.models.invoice import InvoiceDetail
from app.models.payment import PaymentItem
from app.models.sale import SaleDetail
from app.models.user import User

from app.schemas.service import (
    ServiceCreate,
    ServiceStateUpdate,
    ServiceUpdate,
)


router = APIRouter(
    prefix="/api/servicios",
    tags=["Servicios"],
)


def serialize_service(
    servicio: Service
):
    return {
        "id": servicio.id,
        "nombre": servicio.nombre,
        "descripcion": (
            servicio.descripcion
        ),
        "precio": float(
            servicio.precio
        ),
        "estado": (
            servicio.estado
        ),
    }


@router.get("")
def get_services(
    db: Session = Depends(
        get_db
    ),
):
    servicios = (
        db.query(Service)
        .order_by(
            Service.id.desc()
        )
        .all()
    )

    return {
        "ok": True,
        "servicios": [
            serialize_service(
                servicio
            )
            for servicio
            in servicios
        ],
    }


@router.get(
    "/{service_id}"
)
def get_service(
    service_id: int,
    db: Session = Depends(
        get_db
    ),
):
    servicio = (
        db.query(Service)
        .filter(
            Service.id
            == service_id
        )
        .first()
    )

    if servicio is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Servicio no encontrado."
            ),
        )

    return {
        "ok": True,
        "servicio": (
            serialize_service(
                servicio
            )
        ),
    }


@router.post(
    "",
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def create_service(
    data: ServiceCreate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    servicio = Service(
        nombre=(
            data.nombre.strip()
        ),
        descripcion=(
            data.descripcion
        ),
        precio=data.precio,
        estado="activo",
    )

    db.add(servicio)
    db.commit()
    db.refresh(servicio)

    return {
        "ok": True,
        "message": (
            "Servicio creado correctamente."
        ),
        "servicio": (
            serialize_service(
                servicio
            )
        ),
    }


@router.put(
    "/{service_id}"
)
def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    servicio = (
        db.query(Service)
        .filter(
            Service.id
            == service_id
        )
        .first()
    )

    if servicio is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Servicio no encontrado."
            ),
        )

    servicio.nombre = (
        data.nombre.strip()
    )

    servicio.descripcion = (
        data.descripcion
    )

    servicio.precio = (
        data.precio
    )

    db.commit()
    db.refresh(servicio)

    return {
        "ok": True,
        "message": (
            "Servicio actualizado correctamente."
        ),
        "servicio": (
            serialize_service(
                servicio
            )
        ),
    }


@router.patch(
    "/{service_id}/estado"
)
def change_service_state(
    service_id: int,
    data: ServiceStateUpdate,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    servicio = (
        db.query(Service)
        .filter(
            Service.id
            == service_id
        )
        .first()
    )

    if servicio is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Servicio no encontrado."
            ),
        )

    servicio.estado = (
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
    "/{service_id}"
)
def delete_service(
    service_id: int,
    db: Session = Depends(
        get_db
    ),
    current_user: User = Depends(
        require_roles(
            "Administrador"
        )
    ),
):
    servicio = (
        db.query(Service)
        .filter(
            Service.id
            == service_id
        )
        .first()
    )

    if servicio is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Servicio no encontrado."
            ),
        )

    # Los servicios pueden aparecer en ventas históricas; se conserva el
    # registro y se impide que vuelva a venderse.
    tiene_historial = any((
        db.query(SaleDetail.id).filter(SaleDetail.servicio_id == service_id).first(),
        db.query(InvoiceDetail.id).filter(InvoiceDetail.servicio_id == service_id).first(),
        db.query(PaymentItem.id).filter(PaymentItem.servicio_id == service_id).first(),
    ))

    if tiene_historial:
        servicio.estado = "inactivo"
        mensaje = "Servicio desactivado porque tiene historial asociado."
    else:
        db.delete(servicio)
        mensaje = "Servicio eliminado correctamente."

    db.commit()

    return {
        "ok": True,
        "message": mensaje,
    }
