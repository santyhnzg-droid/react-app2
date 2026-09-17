from decimal import Decimal

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


class ProductCreate(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=120,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
    )

    precio: Decimal = Field(
        ge=0
    )

    stock: int = Field(
        ge=0
    )

    imagen: str | None = Field(
        default=None,
        max_length=255,
    )

    categoria_id: int | None = Field(
        default=None,
        ge=1,
    )


class ProductUpdate(
    ProductCreate
):
    pass


class ProductStateUpdate(BaseModel):
    estado: str

    @field_validator(
        "estado"
    )
    @classmethod
    def validate_state(
        cls,
        value: str
    ):
        if value not in (
            "activo",
            "inactivo",
        ):
            raise ValueError(
                "El estado debe ser activo o inactivo."
            )

        return value