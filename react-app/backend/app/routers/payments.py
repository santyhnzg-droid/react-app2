from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
import logging
from uuid import uuid4

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.payment import Payment, PaymentItem
from app.models.invoice import Invoice, InvoiceDetail
from app.models.product import Product
from app.models.sale import Sale, SaleDetail
from app.models.service import Service
from app.models.user import User
from app.schemas.payment import CheckoutCartCreate, CheckoutCreate, CheckoutResponse
from app.services.email import send_invoice_email


router = APIRouter(prefix="/api/pagos", tags=["Pagos"])
logger = logging.getLogger(__name__)


def _send_invoice_if_needed(db: Session, payment: Payment) -> None:
    """Envía el comprobante una sola vez después de confirmar la transacción."""
    invoice = payment.venta.factura if payment.venta else None
    if invoice is None or invoice.email_sent_at is not None or not invoice.cliente_email:
        return
    if send_invoice_email(invoice):
        invoice.email_sent_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()


def _frontend_origin(request: Request) -> str:
    """Use the browser host for Stripe's return URL during local development."""
    origin = request.headers.get("origin", "").rstrip("/")
    allowed_origins = {
        item.strip().rstrip("/")
        for item in settings.CORS_ORIGINS.split(",")
        if item.strip()
    }
    return origin if origin in allowed_origins else settings.FRONTEND_URL


def _stripe_amount(amount: Decimal) -> int:
    return int((amount * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _stripe_dict(value):
    """Convierte StripeObject y diccionarios a una estructura uniforme."""
    if hasattr(value, "to_dict_recursive"):
        return value.to_dict_recursive()
    if hasattr(value, "to_dict"):
        return value.to_dict()
    return value


def _require_stripe_secret():
    if (
        not settings.STRIPE_SECRET_KEY
        or not settings.STRIPE_SECRET_KEY.startswith("sk_")
        or "..." in settings.STRIPE_SECRET_KEY
        or "REEMPLAZAR" in settings.STRIPE_SECRET_KEY
    ):
        raise HTTPException(status_code=503, detail="Stripe no está configurado en el backend.")
    stripe.api_key = settings.STRIPE_SECRET_KEY


def _complete_paid_payment(db: Session, payment: Payment, session_data) -> None:
    """Confirm a paid Checkout Session exactly once and create its sale."""
    session_data = _stripe_dict(session_data)
    if payment.estado == "APPROVED":
        return
    # FAILED y CANCELLED son estados terminales. Un evento retrasado de Stripe
    # no puede reabrirlos ni crear una venta fuera del flujo permitido.
    if payment.estado != "PENDING":
        return
    if session_data.get("payment_status") != "paid":
        return

    valid_amount = session_data.get("amount_total") == _stripe_amount(payment.monto)
    valid_currency = (session_data.get("currency") or "").lower() == payment.moneda.lower()
    if not valid_amount or not valid_currency:
        payment.estado = "FAILED"
        payment.mensaje_error = "El importe o la moneda del pago no coinciden."
        return

    payment.stripe_payment_intent_id = session_data.get("payment_intent")
    items = payment.items or [payment]
    locked_items = []
    for item in items:
        if isinstance(item, Payment) or item.tipo == "producto":
            producto = db.query(Product).filter(Product.id == item.producto_id).with_for_update().first()
            if producto is None or producto.stock < item.cantidad:
                payment.estado = "FAILED"
                payment.mensaje_error = "Stock insuficiente para completar el pago."
                return
            locked_items.append((item, producto, item.cantidad, "producto"))
        else:
            servicio = db.query(Service).filter(Service.id == item.servicio_id).first()
            if servicio is None or servicio.estado != "activo":
                payment.estado = "FAILED"
                payment.mensaje_error = "El servicio ya no está disponible."
                return
            locked_items.append((item, servicio, item.cantidad, "servicio"))

    for _, catalog_item, quantity, item_type in locked_items:
        if item_type == "producto":
            catalog_item.stock -= quantity

    sale = Sale(
        cliente_id=payment.usuario_id,
        usuario_id=payment.usuario_id,
        subtotal=payment.monto,
        descuento=Decimal("0.00"),
        impuestos=Decimal("0.00"),
        total=payment.monto,
        moneda=payment.moneda.upper(),
        estado="pagada",
        origen="web",
    )
    db.add(sale)
    db.flush()
    for item, catalog_item, quantity, item_type in locked_items:
        price = item.producto.precio if isinstance(item, Payment) else item.precio_unitario
        db.add(SaleDetail(
            venta_id=sale.id,
            producto_id=item.producto_id if item_type == "producto" else None,
            servicio_id=item.servicio_id if item_type == "servicio" else None,
            tipo=item_type,
            cantidad=quantity,
            precio_unitario=price,
            descuento=Decimal("0.00"),
            subtotal=price * quantity,
        ))

    # Toda venta web pagada queda facturada en la misma transacción. Así no
    # existe una venta aprobada sin documento descargable para el cliente.
    customer = db.query(User).filter(User.id == payment.usuario_id).first()
    if customer is None:
        raise HTTPException(status_code=409, detail="El cliente del pago ya no existe.")
    invoice = Invoice(
        venta_id=sale.id,
        cliente_id=customer.id,
        subtotal=payment.monto,
        descuento=Decimal("0.00"),
        impuestos=Decimal("0.00"),
        total=payment.monto,
        moneda=payment.moneda.upper(),
        estado="pagada",
        cliente_nombre=f"{customer.nombre} {customer.apellido}".strip(),
        cliente_documento=customer.numero_documento,
        cliente_email=customer.email,
    )
    db.add(invoice)
    db.flush()
    for item, catalog_item, quantity, item_type in locked_items:
        price = item.producto.precio if isinstance(item, Payment) else item.precio_unitario
        db.add(InvoiceDetail(
            factura_id=invoice.id,
            producto_id=item.producto_id if item_type == "producto" else None,
            servicio_id=item.servicio_id if item_type == "servicio" else None,
            tipo=item_type,
            descripcion=catalog_item.nombre,
            cantidad=quantity,
            precio_unitario=price,
            descuento=Decimal("0.00"),
            subtotal=price * quantity,
        ))
    payment.venta_id = sale.id
    payment.estado = "APPROVED"


@router.post("/stripe/checkout", response_model=CheckoutResponse)
def create_checkout(
    data: CheckoutCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Cliente", "Empleado", "Administrador")
    ),
):
    _require_stripe_secret()
    frontend_origin = _frontend_origin(request)
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
            success_url=f"{frontend_origin}/pago/exitoso?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_origin}/pago/cancelado",
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
        logger.exception("Error al crear checkout de Stripe", exc_info=exc)
        raise HTTPException(status_code=502, detail="No fue posible crear la sesión de Stripe.") from exc


@router.post("/stripe/cart-checkout", response_model=CheckoutResponse)
def create_cart_checkout(
    data: CheckoutCartCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Cliente", "Empleado", "Administrador")
    ),
):
    _require_stripe_secret()
    frontend_origin = _frontend_origin(request)
    product_ids = [item.producto_id for item in data.items if item.tipo == "producto"]
    service_ids = [item.servicio_id for item in data.items if item.tipo == "servicio"]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="No repitas productos en el carrito.")
    if len(service_ids) != len(set(service_ids)):
        raise HTTPException(status_code=400, detail="No repitas servicios en el carrito.")

    products = {
        product.id: product
        for product in db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    }
    services = {service.id: service for service in db.query(Service).filter(Service.id.in_(service_ids)).all()} if service_ids else {}
    line_items = []
    total = Decimal("0.00")
    total_quantity = 0
    for item in data.items:
        catalog_item = products.get(item.producto_id) if item.tipo == "producto" else services.get(item.servicio_id)
        product = catalog_item
        if catalog_item is None:
            raise HTTPException(status_code=404, detail="Producto o servicio no encontrado.")
        if catalog_item.estado != "activo":
            raise HTTPException(status_code=400, detail=f"El producto '{product.nombre}' está inactivo.")
        if item.tipo == "producto" and catalog_item.stock < item.cantidad:
            raise HTTPException(status_code=409, detail=f"Stock insuficiente para '{product.nombre}'.")
        total += catalog_item.precio * item.cantidad
        total_quantity += item.cantidad
        line_items.append({
            "price_data": {
                "currency": settings.STRIPE_CURRENCY,
                "product_data": {"name": catalog_item.nombre},
                "unit_amount": _stripe_amount(catalog_item.precio),
            },
            "quantity": item.cantidad,
        })

    payment = Payment(
        usuario_id=current_user.id,
        producto_id=product_ids[0] if product_ids else None,
        referencia_externa=(f"servicios:{','.join(str(service_id) for service_id in service_ids)}" if service_ids else None),
        stripe_session_id=f"pending-{uuid4().hex}",
        monto=total,
        moneda=settings.STRIPE_CURRENCY,
        estado="PENDING",
        cantidad=total_quantity,
    )
    db.add(payment)
    db.flush()
    for item in data.items:
        catalog_item = products.get(item.producto_id) if item.tipo == "producto" else services.get(item.servicio_id)
        db.add(PaymentItem(
            payment_id=payment.id,
            producto_id=catalog_item.id if item.tipo == "producto" else None,
            servicio_id=catalog_item.id if item.tipo == "servicio" else None,
            tipo=item.tipo,
            cantidad=item.cantidad,
            precio_unitario=catalog_item.precio,
        ))

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{frontend_origin}/pago/exitoso?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_origin}/pago/cancelado",
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
    event_object = _stripe_dict(event["data"]["object"])
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
        _complete_paid_payment(db, payment, event_object)
    elif event_type == "checkout.session.expired" and payment.estado == "PENDING":
        payment.estado = "CANCELLED"
    elif event_type == "payment_intent.payment_failed" and payment.estado == "PENDING":
        payment.estado = "FAILED"
    db.commit()
    if payment.estado == "APPROVED":
        _send_invoice_if_needed(db, payment)
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

    # El webhook es el mecanismo principal. Esta consulta evita que el pago
    # quede eternamente pendiente cuando Stripe CLI/webhook aún no está activo.
    if payment.estado == "PENDING":
        try:
            _require_stripe_secret()
            session = _stripe_dict(
                stripe.checkout.Session.retrieve(payment.stripe_session_id)
            )
            if session.get("status") == "expired":
                payment.estado = "CANCELLED"
            else:
                _complete_paid_payment(db, payment, session)
            db.commit()
            if payment.estado == "APPROVED":
                _send_invoice_if_needed(db, payment)
        except Exception as exc:
            db.rollback()
            logger.exception("No fue posible sincronizar el estado del pago", exc_info=exc)

    return {
        "id": payment.id,
        "estado": payment.estado,
        "monto": float(payment.monto),
        "moneda": payment.moneda,
        "producto_id": payment.producto_id,
        "venta_id": payment.venta_id,
        "mensaje_error": payment.mensaje_error,
        "factura_id": payment.venta.factura.id if payment.venta and payment.venta.factura else None,
        "numero_factura": payment.venta.factura.numero_factura if payment.venta and payment.venta.factura else None,
    }
