from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


SaleStatus = Literal["pendiente", "pagada", "cancelada", "reembolsada"]
SaleOrigin = Literal["web", "empleado", "admin", "legacy"]
DetailType = Literal["producto", "servicio"]


class SaleItemCreate(BaseModel):
    tipo: DetailType | None = None
    producto_id: int | None = Field(default=None, ge=1)
    servicio_id: int | None = Field(default=None, ge=1)
    cantidad: int = Field(ge=1)
    descuento: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)

    @model_validator(mode="after")
    def validate_reference(self):
        references = [self.producto_id, self.servicio_id]
        if sum(reference is not None for reference in references) != 1:
            raise ValueError("Cada detalle debe tener exactamente un producto o servicio.")
        inferred_type: DetailType = "producto" if self.producto_id is not None else "servicio"
        if self.tipo is not None and self.tipo != inferred_type:
            raise ValueError("El tipo debe coincidir con el producto_id o servicio_id enviado.")
        self.tipo = inferred_type
        return self


class SaleCreate(BaseModel):
    cliente_id: int | None = Field(default=None, ge=1)
    items: list[SaleItemCreate] = Field(min_length=1)
    descuento: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)
    impuestos: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)
    moneda: str = Field(default="COP", min_length=3, max_length=3)
    observaciones: str | None = Field(default=None, max_length=500)


class SaleStateUpdate(BaseModel):
    estado: SaleStatus


class SaleDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: DetailType
    producto_id: int | None
    servicio_id: int | None
    nombre: str | None
    cantidad: int
    precio_unitario: Decimal
    descuento: Decimal
    subtotal: Decimal


class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cliente_id: int | None
    usuario_id: int | None
    subtotal: Decimal
    descuento: Decimal
    impuestos: Decimal
    total: Decimal
    moneda: str
    estado: SaleStatus
    origen: SaleOrigin
    fecha: datetime
    observaciones: str | None
    detalles: list[SaleDetailResponse]
