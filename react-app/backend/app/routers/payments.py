from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.payment import Payment, PaymentItem
from app.models.product import Product
from app.models.user import User
from app.schemas.payment import CheckoutCartCreate, CheckoutCreate, CheckoutResponse


router = APIRouter(prefix="/api/pagos", tags=["Pagos"])


def _stripe_amount(amount: Decimal) -> int:
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _require_stripe_secret():
    if (
        not settings.STRIPE_SECRET_KEY
        or not settings.STRIPE_SECRET_KEY.startswith("sk_")
        or "..." in settings.STRIPE_SECRET_KEY
        or "REEMPLAZAR" in settings.STRIPE_SECRET_KEY
    ):
        raise HTTPException(status_code=503, detail="Stripe no está configurado en el backend.")
    stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/stripe/checkout", response_model=CheckoutResponse)
def create_checkout(
    data: CheckoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Cliente", "Empleado", "Administrador")
    ),
):
    _require_stripe_secret()
    producto = db.query(Product).filter(Product.id == data.producto_id).with_for_update().first()
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    if producto.estado != "activo":
        raise HTTPException(status_code=400, detail="El producto está inactivo.")
    if producto.stock < data.cantidad:
        raise HTTPException(status_code=409, detail=f"Stock insuficiente. Disponible: {producto.stock}.")

    pago = Payment(
        usuario_id=current_user.id,
        producto_id=producto.id,
        stripe_session_id=f"pending-{uuid4().hex}",
        monto=producto.precio * data.cantidad,
        moneda=settings.STRIPE_CURRENCY,
        estado="PENDING",
        cantidad=data.cantidad,
    )
    db.add(pago)
    db.flush()
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{
                "price_data": {
                    "currency": settings.STRIPE_CURRENCY,
                    "product_data": {"name": producto.nombre},
                    "unit_amount": _stripe_amount(producto.precio),
                },
                "quantity": data.cantidad,
            }],
            success_url=f"{settings.FRONTEND_URL}/pago/exitoso?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pago/cancelado",
            metadata={
                "payment_id": str(pago.id),
                "usuario_id": str(current_user.id),
                "producto_id": str(producto.id),
                "cantidad": str(data.cantidad),
            },
            payment_intent_data={
                "metadata": {
                    "payment_id": str(pago.id),
                },
            },
        )
        pago.stripe_session_id = session.id
        db.commit()
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail="No fue posible crear la sesión de Stripe.") from exc


@router.post("/stripe/cart-checkout", response_model=CheckoutResponse)
def create_cart_checkout(
    data: CheckoutCartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Cliente", "Empleado", "Administrador")
    ),
):
    _require_stripe_secret()
    product_ids = [item.producto_id for item in data.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="No repitas productos en el carrito.")

    products = {
        product.id: product
        for product in db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    }
    line_items = []
    total = Decimal("0.00")
    total_quantity = 0
    for item in data.items:
        product = products.get(item.producto_id)
        if product is None:
            raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no encontrado.")
        if product.estado != "activo":
            raise HTTPException(status_code=400, detail=f"El producto '{product.nombre}' está inactivo.")
        if product.stock < item.cantidad:
            raise HTTPException(status_code=409, detail=f"Stock insuficiente para '{product.nombre}'.")
        total += product.precio * item.cantidad
        total_quantity += item.cantidad
        line_items.append({
            "price_data": {
                "currency": settings.STRIPE_CURRENCY,
                "product_data": {"name": product.nombre},
                "unit_amount": _stripe_amount(product.precio),
            },
            "quantity": item.cantidad,
        })

    payment = Payment(
        usuario_id=current_user.id,
        producto_id=data.items[0].producto_id,
        stripe_session_id=f"pending-{uuid4().hex}",
        monto=total,
        moneda=settings.STRIPE_CURRENCY,
        estado="PENDING",
        cantidad=total_quantity,
    )
    db.add(payment)
    db.flush()
    for item in data.items:
        product = products[item.producto_id]
        db.add(PaymentItem(
            payment_id=payment.id,
            producto_id=product.id,
            cantidad=item.cantidad,
            precio_unitario=product.precio,
        ))

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{settings.FRONTEND_URL}/pago/exitoso?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pago/cancelado",
            metadata={"payment_id": str(payment.id), "usuario_id": str(current_user.id)},
            payment_intent_data={"metadata": {"payment_id": str(payment.id)}},
        )
        payment.stripe_session_id = session.id
        db.commit()
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail="No fue posible crear la sesión de Stripe.") from exc


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    if (
        not settings.STRIPE_WEBHOOK_SECRET
        or not settings.STRIPE_WEBHOOK_SECRET.startswith("whsec_")
        or "..." in settings.STRIPE_WEBHOOK_SECRET
        or "REEMPLAZAR" in settings.STRIPE_WEBHOOK_SECRET
    ):
        raise HTTPException(status_code=503, detail="Stripe webhook no está configurado.")
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload,
            request.headers.get("stripe-signature"),
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=400, detail="Firma de webhook inválida.") from exc

    event_type = event["type"]
    event_object = event["data"]["object"]
    payment = None
    if event_type in ("checkout.session.completed", "checkout.session.expired"):
        payment = db.query(Payment).filter(
            Payment.stripe_session_id == event_object.get("id")
        ).with_for_update().first()
    elif event_type == "payment_intent.payment_failed":
        payment = db.query(Payment).filter(
            Payment.stripe_payment_intent_id == event_object.get("id")
        ).with_for_update().first()
        if payment is None:
            payment_id = (event_object.get("metadata") or {}).get("payment_id")
            if payment_id:
                payment = db.query(Payment).filter(
                    Payment.id == int(payment_id)
                ).with_for_update().first()

    if payment is None:
        return {"received": True}
    if event_type == "checkout.session.completed":
        if payment.estado == "APPROVED":
            return {"received": True}
        if event_object.get("payment_status") != "paid":
            return {"received": True}
        valid_amount = event_object.get("amount_total") == _stripe_amount(payment.monto)
        valid_currency = event_object.get("currency") == payment.moneda
        if not valid_amount or not valid_currency:
            payment.estado = "FAILED"
        else:
            payment.stripe_payment_intent_id = event_object.get("payment_intent")
            items = payment.items or [payment]
            locked_products = []
            for item in items:
                producto = db.query(Product).filter(
                    Product.id == item.producto_id
                ).with_for_update().first()
                if producto is None or producto.stock < item.cantidad:
                    payment.estado = "FAILED"
                    break
                locked_products.append((producto, item.cantidad))
            else:
                for producto, cantidad in locked_products:
                    producto.stock -= cantidad
                payment.estado = "APPROVED"
    elif event_type == "checkout.session.expired" and payment.estado == "PENDING":
        payment.estado = "CANCELLED"
    elif event_type == "payment_intent.payment_failed" and payment.estado == "PENDING":
        payment.estado = "FAILED"
    db.commit()
    return {"received": True}


@router.get("/stripe/session/{session_id}")
def get_checkout_status(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Cliente", "Empleado", "Administrador")
    ),
):
    payment = db.query(Payment).filter(Payment.stripe_session_id == session_id).first()
    if payment is None:
        raise HTTPException(status_code=404, detail="Pago no encontrado.")
    is_admin = current_user.rol and current_user.rol.nombre == "Administrador"
    if not is_admin and payment.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes consultar este pago.")
    return {
        "id": payment.id,
        "estado": payment.estado,
        "monto": float(payment.monto),
        "moneda": payment.moneda,
        "producto_id": payment.producto_id,
    }
