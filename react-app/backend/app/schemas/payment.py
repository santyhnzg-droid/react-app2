from pydantic import BaseModel, Field


class CheckoutCreate(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(default=1, ge=1)


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class CheckoutItem(BaseModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class CheckoutCartCreate(BaseModel):
    items: list[CheckoutItem] = Field(min_length=1)
