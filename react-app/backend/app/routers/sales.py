from datetime import date, datetime, time
from decimal import Decimal
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.product import Product
from app.models.sale import Sale, SaleDetail
from app.models.service import Service
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleResponse, SaleStateUpdate


router = APIRouter(prefix="/api/ventas", tags=["Ventas"])
logger = logging.getLogger(__name__)

SALE_STATUS_ALIASES = {
    "pagado": "pagada",
    "cancelado": "cancelada",
    "reembolsado": "reembolsada",
}
SALE_STATUSES = {"pendiente", "pagada", "cancelada", "reembolsada"}


def normalize_sale_status(value: str) -> str:
    normalized = SALE_STATUS_ALIASES.get(value.strip().lower(), value.strip().lower())
    if normalized not in SALE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Estado de venta inválido. Usa pendiente, pagada, cancelada o reembolsada.",
        )
    return normalized

SALE_TRANSITIONS = {
    "pendiente": {"pagada", "cancelada"},
    "pagada": {"reembolsada"},
    "cancelada": set(),
    "reembolsada": set(),
}


def _serialize_detail(detail: SaleDetail) -> dict:
    item = detail.producto or detail.servicio
    return {
        "id": detail.id,
        "tipo": detail.tipo,
        "producto_id": detail.producto_id,
        "servicio_id": detail.servicio_id,
        "nombre": item.nombre if item else None,
        "cantidad": detail.cantidad,
        "precio_unitario": detail.precio_unitario,
        "descuento": detail.descuento,
        "subtotal": detail.subtotal,
    }


def serialize_sale(sale: Sale) -> dict:
    return {
        "id": sale.id,
        "cliente_id": sale.cliente_id,
        "usuario_id": sale.usuario_id,
        "subtotal": sale.subtotal,
        "descuento": sale.descuento,
        "impuestos": sale.impuestos,
        "total": sale.total,
        "moneda": sale.moneda,
        "estado": sale.estado,
        "origen": sale.origen,
        "fecha": sale.fecha,
        "observaciones": sale.observaciones,
        "detalles": [_serialize_detail(detail) for detail in sale.detalles],
    }


def _sales_query(db: Session):
    return db.query(Sale).options(
        joinedload(Sale.detalles).joinedload(SaleDetail.producto),
        joinedload(Sale.detalles).joinedload(SaleDetail.servicio),
    )


@router.get("/resumen")
def get_sales_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    # Un pago aprobado de Stripe crea una venta web; contar ambas entidades
    # duplicaba cada compra online.
    manual_query = db.query(Sale).filter(Sale.origen != "web", Sale.estado == "pagada")
    web_query = db.query(Sale).filter(Sale.origen == "web", Sale.estado == "pagada")
    manual_count = manual_query.count()
    manual_total = manual_query.with_entities(func.coalesce(func.sum(Sale.total), 0)).scalar() or 0
    stripe_count = web_query.count()
    stripe_total = web_query.with_entities(func.coalesce(func.sum(Sale.total), 0)).scalar() or 0
    recent_sales = [
        {"tipo": "manual", "id": sale.id, "monto": float(sale.total), "estado": sale.estado, "fecha": sale.fecha.isoformat() if sale.fecha else None}
        for sale in db.query(Sale).filter(Sale.origen != "web").order_by(Sale.fecha.desc()).limit(10).all()
    ]
    recent_sales.extend(
        {"tipo": "stripe", "id": sale.id, "monto": float(sale.total), "estado": sale.estado, "fecha": sale.fecha.isoformat() if sale.fecha else None}
        for sale in db.query(Sale).filter(Sale.origen == "web").order_by(Sale.fecha.desc()).limit(10).all()
    )
    recent_sales.sort(key=lambda item: item["fecha"] or "", reverse=True)
    return {"ventas_manuales": manual_count, "pagos_stripe_aprobados": stripe_count, "ventas_totales": manual_count + stripe_count, "ingresos_totales": float(manual_total + stripe_total), "ultimas_ventas": recent_sales[:10]}


@router.get("", response_model=list[SaleResponse])
def list_sales(
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
    cliente_id: int | None = Query(default=None, ge=1),
    producto_id: int | None = Query(default=None, ge=1),
    servicio_id: int | None = Query(default=None, ge=1),
    estado: str | None = None,
    valor_minimo: Decimal | None = Query(default=None, ge=0),
    valor_maximo: Decimal | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    query = _sales_query(db)
    if fecha_inicio:
        query = query.filter(Sale.fecha >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        query = query.filter(Sale.fecha <= datetime.combine(fecha_fin, time.max))
    if cliente_id:
        query = query.filter(Sale.cliente_id == cliente_id)
    if producto_id:
        query = query.filter(Sale.id.in_(db.query(SaleDetail.venta_id).filter(SaleDetail.producto_id == producto_id)))
    if servicio_id:
        query = query.filter(Sale.id.in_(db.query(SaleDetail.venta_id).filter(SaleDetail.servicio_id == servicio_id)))
    if estado:
        query = query.filter(Sale.estado == normalize_sale_status(estado))
    if valor_minimo is not None:
        query = query.filter(Sale.total >= valor_minimo)
    if valor_maximo is not None:
        query = query.filter(Sale.total <= valor_maximo)
    return [serialize_sale(sale) for sale in query.order_by(Sale.fecha.desc()).all()]


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    product_ids = [item.producto_id for item in data.items if item.tipo == "producto"]
    service_ids = [item.servicio_id for item in data.items if item.tipo == "servicio"]
    if len(product_ids) != len(set(product_ids)) or len(service_ids) != len(set(service_ids)):
        raise HTTPException(status_code=400, detail="No repitas el mismo producto o servicio en la venta.")

    if data.cliente_id is not None and db.query(User.id).filter(User.id == data.cliente_id).first() is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado.")

    try:
        products = {item.id: item for item in db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()} if product_ids else {}
        services = {item.id: item for item in db.query(Service).filter(Service.id.in_(service_ids)).all()} if service_ids else {}
        details = []
        subtotal = Decimal("0.00")

        for item in data.items:
            catalog_item = products.get(item.producto_id) if item.tipo == "producto" else services.get(item.servicio_id)
            if catalog_item is None:
                kind = "Producto" if item.tipo == "producto" else "Servicio"
                identifier = item.producto_id or item.servicio_id
                raise HTTPException(status_code=404, detail=f"{kind} {identifier} no encontrado.")
            if catalog_item.estado != "activo":
                raise HTTPException(status_code=400, detail=f"El elemento '{catalog_item.nombre}' está inactivo.")
            if item.tipo == "producto" and catalog_item.stock < item.cantidad:
                raise HTTPException(status_code=409, detail=f"Stock insuficiente para '{catalog_item.nombre}'. Disponible: {catalog_item.stock}.")

            gross = catalog_item.precio * item.cantidad
            if item.descuento > gross:
                raise HTTPException(status_code=400, detail=f"El descuento de '{catalog_item.nombre}' no puede superar su importe.")
            line_subtotal = gross - item.descuento
            subtotal += line_subtotal
            details.append((item, catalog_item, line_subtotal))

        if data.descuento > subtotal:
            raise HTTPException(status_code=400, detail="El descuento general no puede superar el subtotal.")
        total = subtotal - data.descuento + data.impuestos
        role = current_user.rol.nombre if current_user.rol else "Empleado"
        sale = Sale(cliente_id=data.cliente_id, usuario_id=current_user.id, subtotal=subtotal, descuento=data.descuento, impuestos=data.impuestos, total=total, moneda=data.moneda.upper(), estado="pagada", origen="admin" if role == "Administrador" else "empleado", observaciones=data.observaciones)
        db.add(sale)
        db.flush()

        for item, catalog_item, line_subtotal in details:
            if item.tipo == "producto":
                catalog_item.stock -= item.cantidad
            db.add(SaleDetail(venta_id=sale.id, producto_id=item.producto_id, servicio_id=item.servicio_id, tipo=item.tipo, cantidad=item.cantidad, precio_unitario=catalog_item.precio, descuento=item.descuento, subtotal=line_subtotal))

        db.commit()
        db.refresh(sale)
        return {"ok": True, "message": "Venta registrada correctamente.", "venta": serialize_sale(sale)}
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Error al registrar venta", exc_info=exc)
        raise HTTPException(status_code=500, detail="No fue posible registrar la venta.") from exc


@router.get("/mis-compras", response_model=list[SaleResponse])
def get_my_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sales = _sales_query(db).filter(Sale.cliente_id == current_user.id).order_by(Sale.fecha.desc()).all()
    return [serialize_sale(sale) for sale in sales]


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sale = _sales_query(db).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada.")
    is_admin = current_user.rol and current_user.rol.nombre in {"Administrador", "Empleado"}
    if not is_admin and sale.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes consultar esta venta.")
    return serialize_sale(sale)


@router.patch("/{sale_id}/estado", response_model=SaleResponse)
def update_sale_state(
    sale_id: int,
    data: SaleStateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    sale = _sales_query(db).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada.")
    new_state = SALE_STATUS_ALIASES.get(data.estado, data.estado)
    if new_state == sale.estado:
        return serialize_sale(sale)
    if new_state not in SALE_TRANSITIONS.get(sale.estado, set()):
        raise HTTPException(
            status_code=409,
            detail=f"No se puede cambiar una venta de '{sale.estado}' a '{new_state}'.",
        )

    try:
        # El bloqueo evita que dos reembolsos concurrentes devuelvan el stock
        # dos veces.
        sale = (
            _sales_query(db)
            .filter(Sale.id == sale_id)
            .with_for_update()
            .first()
        )
        if sale is None:
            raise HTTPException(status_code=404, detail="Venta no encontrada.")
        if new_state not in SALE_TRANSITIONS.get(sale.estado, set()):
            raise HTTPException(status_code=409, detail="La venta cambió mientras se procesaba la operación.")

        if new_state == "reembolsada":
            for detail in sale.detalles:
                if detail.tipo == "producto":
                    product = (
                        db.query(Product)
                        .filter(Product.id == detail.producto_id)
                        .with_for_update()
                        .first()
                    )
                    if product is None:
                        raise HTTPException(status_code=409, detail="No se puede reembolsar: falta un producto de la venta.")
                    product.stock += detail.cantidad

        sale.estado = new_state
        if sale.factura is not None and new_state in {"cancelada", "reembolsada"}:
            sale.factura.estado = "anulada"
        db.commit()
        db.refresh(sale)
        return serialize_sale(sale)
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        logger.exception("Error al cambiar el estado de la venta", exc_info=exc)
        raise HTTPException(status_code=500, detail="No fue posible actualizar el estado de la venta.") from exc
