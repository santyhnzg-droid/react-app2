from typing import Literal

from pydantic import BaseModel, Field, model_validator


class CheckoutCreate(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(default=1, ge=1)


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class CheckoutItem(BaseModel):
    tipo: Literal["producto", "servicio"] | None = None
    producto_id: int | None = Field(default=None, gt=0)
    servicio_id: int | None = Field(default=None, gt=0)
    cantidad: int = Field(ge=1)

    @model_validator(mode="after")
    def validate_reference(self):
        if (self.producto_id is None) == (self.servicio_id is None):
            raise ValueError("Cada elemento debe ser un producto o un servicio.")
        inferred_type = "producto" if self.producto_id is not None else "servicio"
        if self.tipo is not None and self.tipo != inferred_type:
            raise ValueError("El tipo no coincide con el elemento enviado.")
        self.tipo = inferred_type
        return self


class CheckoutCartCreate(BaseModel):
    items: list[CheckoutItem] = Field(min_length=1)
