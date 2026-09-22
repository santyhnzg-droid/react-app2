from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DailySalesReportRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    fecha: datetime
    venta: int
    cliente: str | None
    tipo: str
    producto_servicio: str | None
    cantidad: int
    precio: Decimal
    subtotal: Decimal
    total: Decimal
    estado: str


class DailySalesReportResponse(BaseModel):
    fecha: date
    ventas: list[DailySalesReportRow]
    total_general: Decimal
