from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.pqr import PQR as PQRModel, PQRResponse as PQRResponseModel
from app.models.user import User
from app.schemas.pqr import PQRCreate, PQRResponse, PQRResponseCreate, PQRStateUpdate


router = APIRouter(prefix="/api/pqr", tags=["PQR"])

PQR_TRANSITIONS = {
    "pendiente": {"en_proceso", "respondida", "cerrada"},
    "en_proceso": {"respondida", "cerrada"},
    "respondida": {"en_proceso", "cerrada"},
    "cerrada": set(),
}


def _query(db: Session):
    return db.query(PQRModel).options(joinedload(PQRModel.respuestas))


def _serialize(pqr: PQRModel, role: str | None) -> dict:
    responses = [response for response in pqr.respuestas if role in {"Administrador", "Empleado"} or not response.es_interna]
    return {
        "id": pqr.id,
        "cliente_id": pqr.cliente_id,
        "asignado_a": pqr.asignado_a,
        "tipo": pqr.tipo,
        "asunto": pqr.asunto,
        "descripcion": pqr.descripcion,
        "estado": pqr.estado,
        "prioridad": pqr.prioridad,
        "fecha_cierre": pqr.fecha_cierre,
        "created_at": pqr.created_at,
        "updated_at": pqr.updated_at,
        "respuestas": [{
            "id": item.id,
            "pqr_id": item.pqr_id,
            "usuario_id": item.usuario_id,
            "mensaje": item.mensaje,
            "es_interna": item.es_interna,
            "created_at": item.created_at,
        } for item in responses],
    }


@router.post("", response_model=PQRResponse, status_code=status.HTTP_201_CREATED)
def create_pqr(
    data: PQRCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Cliente")),
):
    pqr = PQRModel(cliente_id=current_user.id, tipo=data.tipo, asunto=data.asunto.strip(), descripcion=data.descripcion.strip(), estado="pendiente", prioridad="media")
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return _serialize(pqr, "Cliente")


@router.get("", response_model=list[PQRResponse])
def list_pqr(
    estado: str | None = None,
    tipo: str | None = None,
    cliente_id: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = current_user.rol.nombre if current_user.rol else None
    query = _query(db)
    if role not in {"Administrador", "Empleado"}:
        query = query.filter(PQRModel.cliente_id == current_user.id)
    elif cliente_id:
        query = query.filter(PQRModel.cliente_id == cliente_id)
    if estado:
        query = query.filter(PQRModel.estado == estado)
    if tipo:
        query = query.filter(PQRModel.tipo == tipo)
    return [_serialize(item, role) for item in query.order_by(PQRModel.created_at.desc()).all()]


@router.get("/{pqr_id}", response_model=PQRResponse)
def get_pqr(
    pqr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pqr = _query(db).filter(PQRModel.id == pqr_id).first()
    if pqr is None:
        raise HTTPException(status_code=404, detail="PQR no encontrado.")
    role = current_user.rol.nombre if current_user.rol else None
    if role not in {"Administrador", "Empleado"} and pqr.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes consultar este PQR.")
    return _serialize(pqr, role)


@router.patch("/{pqr_id}/estado", response_model=PQRResponse)
def update_pqr_state(
    pqr_id: int,
    data: PQRStateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    pqr = _query(db).filter(PQRModel.id == pqr_id).first()
    if pqr is None:
        raise HTTPException(status_code=404, detail="PQR no encontrado.")
    if data.estado != pqr.estado and data.estado not in PQR_TRANSITIONS.get(pqr.estado, set()):
        raise HTTPException(status_code=409, detail=f"No se puede cambiar un PQR de '{pqr.estado}' a '{data.estado}'.")
    if data.asignado_a is not None:
        assigned = db.query(User).filter(User.id == data.asignado_a).first()
        if assigned is None:
            raise HTTPException(status_code=404, detail="Usuario asignado no encontrado.")
        if assigned.estado != "activo" or not assigned.rol or assigned.rol.nombre not in {"Empleado", "Administrador"}:
            raise HTTPException(status_code=400, detail="El usuario asignado debe ser un empleado o administrador activo.")
        pqr.asignado_a = data.asignado_a
    pqr.estado = data.estado
    if data.prioridad is not None:
        pqr.prioridad = data.prioridad
    pqr.fecha_cierre = datetime.utcnow() if data.estado == "cerrada" else None
    db.commit()
    db.refresh(pqr)
    return _serialize(pqr, current_user.rol.nombre if current_user.rol else None)


@router.post("/{pqr_id}/respuestas", response_model=PQRResponse)
def add_pqr_response(
    pqr_id: int,
    data: PQRResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    pqr = _query(db).filter(PQRModel.id == pqr_id).first()
    if pqr is None:
        raise HTTPException(status_code=404, detail="PQR no encontrado.")
    if pqr.estado == "cerrada":
        raise HTTPException(status_code=409, detail="No se pueden agregar respuestas a un PQR cerrado.")
    response = PQRResponseModel(pqr_id=pqr.id, usuario_id=current_user.id, mensaje=data.mensaje.strip(), es_interna=data.es_interna)
    db.add(response)
    if not data.es_interna and pqr.estado not in {"cerrada", "respondida"}:
        pqr.estado = "respondida"
    db.commit()
    db.refresh(pqr)
    return _serialize(pqr, current_user.rol.nombre if current_user.rol else None)
