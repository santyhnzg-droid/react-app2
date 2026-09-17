from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import validate_password_value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=100)


class AuthUserResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: EmailStr
    estado: str
    rol_id: int
    rol: str | None = None


class LoginResponse(BaseModel):
    ok: bool
    message: str
    token: str
    usuario: AuthUserResponse


class MeUserResponse(AuthUserResponse):
    tipo_documento: str
    numero_documento: str
    direccion: str
    telefono: str


class MeResponse(BaseModel):
    ok: bool
    usuario: MeUserResponse


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    token: str = Field(min_length=20, max_length=255)
    nueva_password: str = Field(min_length=8, max_length=30)

    @field_validator("nueva_password")
    @classmethod
    def validate_new_password(cls, value: str):
        return validate_password_value(value)
