from decimal import Decimal

from pydantic import (
    BaseModel,
    Field,
    field_validator,
)


class ServiceCreate(BaseModel):
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


class ServiceUpdate(
    ServiceCreate
):
    pass


class ServiceStateUpdate(BaseModel):
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