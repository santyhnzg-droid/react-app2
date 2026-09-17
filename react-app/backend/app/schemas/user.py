import re

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
)


def validate_password_value(
    value: str
) -> str:
    if not re.search(
        r"[A-Z]",
        value
    ):
        raise ValueError(
            "La contraseña debe contener una mayúscula."
        )

    if not re.search(
        r"[a-z]",
        value
    ):
        raise ValueError(
            "La contraseña debe contener una minúscula."
        )

    if not re.search(
        r"\d",
        value
    ):
        raise ValueError(
            "La contraseña debe contener un número."
        )

    return value


class UserRegister(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=50,
    )

    apellido: str = Field(
        min_length=2,
        max_length=50,
    )

    tipo_documento: str = Field(
        min_length=1,
        max_length=20,
    )

    numero_documento: str = Field(
        min_length=6,
        max_length=12,
    )

    direccion: str = Field(
        min_length=3,
        max_length=255,
    )

    telefono: str = Field(
        min_length=10,
        max_length=10,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=30,
    )

    @field_validator(
        "nombre",
        "apellido"
    )
    @classmethod
    def validate_name(
        cls,
        value: str
    ):
        value = value.strip()

        if not re.fullmatch(
            r"[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+",
            value,
        ):
            raise ValueError(
                "Solo se permiten letras y espacios."
            )

        return value

    @field_validator(
        "numero_documento"
    )
    @classmethod
    def validate_document(
        cls,
        value: str
    ):
        if not value.isdigit():
            raise ValueError(
                "El documento debe contener únicamente números."
            )

        return value

    @field_validator(
        "telefono"
    )
    @classmethod
    def validate_phone(
        cls,
        value: str
    ):
        if not value.isdigit():
            raise ValueError(
                "El teléfono debe contener únicamente números."
            )

        return value

    @field_validator(
        "password"
    )
    @classmethod
    def validate_password(
        cls,
        value: str
    ):
        return validate_password_value(
            value
        )


class UserCreateAdmin(
    UserRegister
):
    rol_id: int = Field(
        ge=1,
        le=3,
    )


class UserUpdate(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=50,
    )

    apellido: str = Field(
        min_length=2,
        max_length=50,
    )

    tipo_documento: str = Field(
        min_length=1,
        max_length=20,
    )

    numero_documento: str = Field(
        min_length=6,
        max_length=12,
    )

    direccion: str = Field(
        min_length=3,
        max_length=255,
    )

    telefono: str = Field(
        min_length=10,
        max_length=10,
    )

    email: EmailStr

    rol_id: int = Field(
        ge=1,
        le=3,
    )

    password: str | None = Field(
        default=None,
        min_length=8,
        max_length=30,
    )

    @field_validator(
        "password"
    )
    @classmethod
    def validate_optional_password(
        cls,
        value
    ):
        if value is None:
            return value

        return validate_password_value(
            value
        )


class UserStateUpdate(BaseModel):
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