from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


InvoiceStatus = Literal["emitida", "pagada", "anulada"]


class InvoiceCreate(BaseModel):
    venta_id: int = Field(gt=0)


class InvoiceDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    producto_id: int | None
    servicio_id: int | None
    tipo: str
    descripcion: str
    cantidad: int
    precio_unitario: Decimal
    descuento: Decimal
    subtotal: Decimal


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    venta_id: int
    cliente_id: int
    numero_factura: str
    fecha: datetime
    subtotal: Decimal
    descuento: Decimal
    impuestos: Decimal
    total: Decimal
    moneda: str
    estado: InvoiceStatus
    cliente_nombre: str
    cliente_documento: str
    cliente_email: str | None
    detalles: list[InvoiceDetailResponse]
