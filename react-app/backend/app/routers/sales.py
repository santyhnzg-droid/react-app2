from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.product import Product
from app.models.payment import Payment
from app.models.sale import Sale, SaleDetail
from app.models.user import User
from app.schemas.sale import SaleCreate


router = APIRouter(
    prefix="/api/ventas",
    tags=["Ventas"],
)


@router.get("/resumen")
def get_sales_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Empleado", "Administrador")
    ),
):
    manual_count = db.query(func.count(Sale.id)).scalar() or 0
    manual_total = db.query(func.coalesce(func.sum(Sale.total), 0)).scalar() or 0
    stripe_count = (
        db.query(func.count(Payment.id))
        .filter(Payment.estado == "APPROVED")
        .scalar()
        or 0
    )
    stripe_total = (
        db.query(func.coalesce(func.sum(Payment.monto), 0))
        .filter(Payment.estado == "APPROVED")
        .scalar()
        or 0
    )
    recent_sales = [
        {
            "tipo": "manual",
            "id": sale.id,
            "monto": float(sale.total),
            "estado": "APPROVED",
            "fecha": sale.fecha.isoformat() if sale.fecha else None,
        }
        for sale in db.query(Sale).order_by(Sale.fecha.desc()).limit(10).all()
    ]
    recent_sales.extend(
        {
            "tipo": "stripe",
            "id": payment.id,
            "monto": float(payment.monto),
            "estado": payment.estado,
            "fecha": payment.created_at.isoformat() if payment.created_at else None,
            "producto_id": payment.producto_id,
            "cantidad": payment.cantidad,
        }
        for payment in db.query(Payment)
        .filter(Payment.estado == "APPROVED")
        .order_by(Payment.created_at.desc())
        .limit(10)
        .all()
    )
    recent_sales.sort(key=lambda item: item["fecha"] or "", reverse=True)

    return {
        "ventas_manuales": manual_count,
        "pagos_stripe_aprobados": stripe_count,
        "ventas_totales": manual_count + stripe_count,
        "ingresos_totales": float(manual_total + stripe_total),
        "ultimas_ventas": recent_sales[:10],
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Empleado", "Administrador")
    ),
):
    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="La venta debe contener al menos un producto.",
        )

    product_ids = [item.producto_id for item in data.items]

    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=400,
            detail="No repitas el mismo producto. Ajusta su cantidad en un solo ítem.",
        )

    try:
        products = (
            db.query(Product)
            .filter(Product.id.in_(product_ids))
            .with_for_update()
            .all()
        )

        products_by_id = {
            product.id: product
            for product in products
        }

        total = Decimal("0.00")

        for item in data.items:
            product = products_by_id.get(item.producto_id)

            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Producto {item.producto_id} no encontrado.",
                )

            if product.estado != "activo":
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto '{product.nombre}' está inactivo.",
                )

            if product.stock < item.cantidad:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Stock insuficiente para '{product.nombre}'. "
                        f"Disponible: {product.stock}."
                    ),
                )

            total += product.precio * item.cantidad

        venta = Sale(
            usuario_id=current_user.id,
            total=total,
        )

        db.add(venta)
        db.flush()

        for item in data.items:
            product = products_by_id[item.producto_id]

            product.stock -= item.cantidad

            detalle = SaleDetail(
                venta_id=venta.id,
                producto_id=product.id,
                cantidad=item.cantidad,
                precio_unitario=product.precio,
            )

            db.add(detalle)

        db.commit()
        db.refresh(venta)

        return {
            "ok": True,
            "message": "Venta registrada correctamente.",
            "venta": {
                "id": venta.id,
                "total": float(venta.total),
            },
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No fue posible registrar la venta.",
        ) from exc
