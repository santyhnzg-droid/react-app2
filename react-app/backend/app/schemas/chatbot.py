from datetime import datetime

from pydantic import BaseModel, Field


class ChatMessageCreate(BaseModel):
    mensaje: str = Field(min_length=1, max_length=2000)
    conversacion_id: int | None = Field(default=None, ge=1)


class ChatMessageResponse(BaseModel):
    conversacion_id: int
    respuesta: str
    created_at: datetime
