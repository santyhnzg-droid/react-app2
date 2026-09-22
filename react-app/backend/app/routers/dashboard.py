from datetime import date, datetime, time
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.product import Product
from app.models.pqr import PQR
from app.models.sale import Sale, SaleDetail
from app.models.service import Service
from app.models.user import User


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

SALE_STATUS_ALIASES = {
    "pagado": "pagada",
    "cancelado": "cancelada",
    "reembolsado": "reembolsada",
}
SALE_STATUSES = {"pendiente", "pagada", "cancelada", "reembolsada"}


@router.get("/admin")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    total_usuarios = db.query(func.count(User.id)).scalar() or 0
    productos_activos = db.query(func.count(Product.id)).filter(Product.estado == "activo").scalar() or 0
    servicios_activos = db.query(func.count(Service.id)).filter(Service.estado == "activo").scalar() or 0
    total_ventas = db.query(func.count(Sale.id)).filter(Sale.estado == "pagada").scalar() or 0
    valor_ventas = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(Sale.estado == "pagada").scalar() or Decimal("0")
    total_facturas = db.query(func.count(Invoice.id)).scalar() or 0
    total_facturacion = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(Invoice.estado != "anulada").scalar() or Decimal("0")
    total_pqr = db.query(func.count(PQR.id)).scalar() or 0
    pqr_pendientes = db.query(func.count(PQR.id)).filter(PQR.estado.in_(["pendiente", "en_proceso"])).scalar() or 0
    return {
        "total_usuarios": total_usuarios,
        "productos_activos": productos_activos,
        "servicios_activos": servicios_activos,
        "total_ventas": total_ventas,
        "valor_ventas": valor_ventas,
        "total_facturas": total_facturas,
        "total_facturacion": total_facturacion,
        "total_pqr": total_pqr,
        "pqr_pendientes": pqr_pendientes,
    }


@router.get("/ventas")
def sales_dashboard(
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
    producto_id: int | None = Query(default=None, ge=1),
    servicio_id: int | None = Query(default=None, ge=1),
    cliente_id: int | None = Query(default=None, ge=1),
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    sales = db.query(Sale.id)
    if fecha_inicio:
        sales = sales.filter(Sale.fecha >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        sales = sales.filter(Sale.fecha <= datetime.combine(fecha_fin, time.max))
    if cliente_id:
        sales = sales.filter(Sale.cliente_id == cliente_id)
    if estado:
        normalized_status = SALE_STATUS_ALIASES.get(estado.strip().lower(), estado.strip().lower())
        if normalized_status not in SALE_STATUSES:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Estado de venta inválido.")
        sales = sales.filter(Sale.estado == normalized_status)
    else:
        # Los indicadores financieros no deben incluir ventas canceladas ni
        # reembolsadas cuando no se solicita explícitamente otro estado.
        sales = sales.filter(Sale.estado == "pagada")
    if producto_id:
        sales = sales.filter(Sale.id.in_(db.query(SaleDetail.venta_id).filter(SaleDetail.producto_id == producto_id)))
    if servicio_id:
        sales = sales.filter(Sale.id.in_(db.query(SaleDetail.venta_id).filter(SaleDetail.servicio_id == servicio_id)))

    sale_ids = sales.subquery()
    sale_id_select = select(sale_ids.c.id)
    total_ventas = db.query(func.count(Sale.id)).filter(Sale.id.in_(sale_id_select)).scalar() or 0
    total_facturado = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(Sale.id.in_(sale_id_select)).scalar() or Decimal("0")
    ticket_promedio = total_facturado / total_ventas if total_ventas else Decimal("0")

    daily = db.query(func.date(Sale.fecha), func.count(Sale.id), func.coalesce(func.sum(Sale.total), 0)).filter(Sale.id.in_(sale_id_select)).group_by(func.date(Sale.fecha)).order_by(func.date(Sale.fecha)).all()
    monthly_key = func.to_char(Sale.fecha, "YYYY-MM")
    monthly = db.query(monthly_key, func.count(Sale.id), func.coalesce(func.sum(Sale.total), 0)).filter(Sale.id.in_(sale_id_select)).group_by(monthly_key).order_by(monthly_key).all()

    product_sales = db.query(Product.nombre, func.sum(SaleDetail.cantidad), func.coalesce(func.sum(SaleDetail.subtotal), 0)).join(SaleDetail, SaleDetail.producto_id == Product.id).filter(SaleDetail.venta_id.in_(sale_id_select)).group_by(Product.id, Product.nombre).order_by(func.sum(SaleDetail.cantidad).desc()).limit(10).all()
    service_sales = db.query(Service.nombre, func.sum(SaleDetail.cantidad), func.coalesce(func.sum(SaleDetail.subtotal), 0)).join(SaleDetail, SaleDetail.servicio_id == Service.id).filter(SaleDetail.venta_id.in_(sale_id_select)).group_by(Service.id, Service.nombre).order_by(func.sum(SaleDetail.cantidad).desc()).limit(10).all()

    return {
        "total_ventas": total_ventas,
        "total_facturado": total_facturado,
        "ticket_promedio": ticket_promedio,
        "ventas_por_dia": [{"fecha": str(row[0]), "ventas": row[1], "ingresos": row[2]} for row in daily],
        "ventas_por_mes": [{"mes": row[0], "ventas": row[1], "ingresos": row[2]} for row in monthly],
        "productos_mas_vendidos": [{"nombre": row[0], "cantidad": row[1], "ingresos": row[2]} for row in product_sales],
        "servicios_mas_vendidos": [{"nombre": row[0], "cantidad": row[1], "ingresos": row[2]} for row in service_sales],
    }
