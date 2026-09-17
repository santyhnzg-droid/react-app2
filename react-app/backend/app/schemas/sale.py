from pydantic import BaseModel, Field


class SaleItemCreate(BaseModel):
    producto_id: int = Field(ge=1)
    cantidad: int = Field(ge=1)


class SaleCreate(BaseModel):
    items: list[SaleItemCreate] = Field(min_length=1)
