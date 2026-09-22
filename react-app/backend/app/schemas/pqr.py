from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


PQRType = Literal["peticion", "queja", "reclamo", "sugerencia", "otro"]
PQRStatus = Literal["pendiente", "en_proceso", "respondida", "cerrada"]


class PQRCreate(BaseModel):
    tipo: PQRType
    asunto: str = Field(min_length=3, max_length=180)
    descripcion: str = Field(min_length=5, max_length=5000)


class PQRStateUpdate(BaseModel):
    estado: PQRStatus
    asignado_a: int | None = Field(default=None, ge=1)
    prioridad: str | None = Field(default=None, min_length=4, max_length=10)


class PQRResponseCreate(BaseModel):
    mensaje: str = Field(min_length=1, max_length=5000)
    es_interna: bool = False


class PQRResponseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pqr_id: int
    usuario_id: int
    mensaje: str
    es_interna: bool
    created_at: datetime


class PQRResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cliente_id: int
    asignado_a: int | None
    tipo: PQRType
    asunto: str
    descripcion: str
    estado: PQRStatus
    prioridad: str
    fecha_cierre: datetime | None
    created_at: datetime
    updated_at: datetime
    respuestas: list[PQRResponseItem]
