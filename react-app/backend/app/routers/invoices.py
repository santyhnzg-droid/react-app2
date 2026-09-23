from datetime import date, datetime, time
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models.invoice import Invoice, InvoiceDetail
from app.models.sale import Sale
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services.invoice_pdf import build_invoice_pdf


router = APIRouter(prefix="/api/facturas", tags=["Facturas"])

INVOICE_STATUS_ALIASES = {
    "pagado": "pagada",
    "anulado": "anulada",
}


def _invoice_query(db: Session):
    return db.query(Invoice).options(
        joinedload(Invoice.detalles),
        joinedload(Invoice.cliente),
    )


def serialize_invoice(invoice: Invoice) -> dict:
    return {
        "id": invoice.id,
        "venta_id": invoice.venta_id,
        "cliente_id": invoice.cliente_id,
        "numero_factura": invoice.numero_factura,
        "fecha": invoice.fecha,
        "subtotal": invoice.subtotal,
        "descuento": invoice.descuento,
        "impuestos": invoice.impuestos,
        "total": invoice.total,
        "moneda": invoice.moneda,
        "estado": invoice.estado,
        "cliente_nombre": invoice.cliente_nombre,
        "cliente_documento": invoice.cliente_documento,
        "cliente_email": invoice.cliente_email,
        "detalles": [
            {
                "id": detail.id,
                "producto_id": detail.producto_id,
                "servicio_id": detail.servicio_id,
                "tipo": detail.tipo,
                "descripcion": detail.descripcion,
                "cantidad": detail.cantidad,
                "precio_unitario": detail.precio_unitario,
                "descuento": detail.descuento,
                "subtotal": detail.subtotal,
            }
            for detail in invoice.detalles
        ],
    }


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    sale = (
        db.query(Sale)
        .options(joinedload(Sale.detalles), joinedload(Sale.cliente))
        .filter(Sale.id == data.venta_id)
        .first()
    )
    if sale is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada.")
    if sale.cliente_id is None or sale.cliente is None:
        raise HTTPException(status_code=400, detail="La venta debe tener un cliente para generar factura.")
    if sale.estado in {"cancelada", "reembolsada"}:
        raise HTTPException(status_code=400, detail="No se puede facturar una venta cancelada o reembolsada.")
    if db.query(Invoice.id).filter(Invoice.venta_id == sale.id).first() is not None:
        raise HTTPException(status_code=409, detail="La venta ya tiene una factura.")

    invoice = Invoice(
        venta_id=sale.id,
        cliente_id=sale.cliente_id,
        subtotal=sale.subtotal,
        descuento=sale.descuento,
        impuestos=sale.impuestos,
        total=sale.total,
        moneda=sale.moneda,
        estado="pagada" if sale.estado == "pagada" else "emitida",
        cliente_nombre=f"{sale.cliente.nombre} {sale.cliente.apellido}".strip(),
        cliente_documento=sale.cliente.numero_documento,
        cliente_email=sale.cliente.email,
    )
    db.add(invoice)
    try:
        db.flush()
        db.refresh(invoice)
        for detail in sale.detalles:
            item = detail.producto or detail.servicio
            db.add(InvoiceDetail(
                factura_id=invoice.id,
                producto_id=detail.producto_id,
                servicio_id=detail.servicio_id,
                tipo=detail.tipo,
                descripcion=item.nombre if item else "Artículo GameZone",
                cantidad=detail.cantidad,
                precio_unitario=detail.precio_unitario,
                descuento=detail.descuento,
                subtotal=detail.subtotal,
            ))
        db.commit()
        db.refresh(invoice)
        return serialize_invoice(invoice)
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="No fue posible generar la factura.") from exc


@router.get("", response_model=list[InvoiceResponse])
def list_invoices(
    numero_factura: str | None = None,
    cliente_id: int | None = Query(default=None, ge=1),
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = _invoice_query(db)
    role = current_user.rol.nombre if current_user.rol else None
    if role not in {"Administrador", "Empleado"}:
        query = query.filter(Invoice.cliente_id == current_user.id)
    elif cliente_id:
        query = query.filter(Invoice.cliente_id == cliente_id)
    if numero_factura:
        query = query.filter(Invoice.numero_factura.ilike(f"%{numero_factura.strip()}%"))
    if fecha_inicio:
        query = query.filter(Invoice.fecha >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        query = query.filter(Invoice.fecha <= datetime.combine(fecha_fin, time.max))
    if estado:
        query = query.filter(Invoice.estado == INVOICE_STATUS_ALIASES.get(estado.lower(), estado.lower()))
    return [serialize_invoice(invoice) for invoice in query.order_by(Invoice.fecha.desc()).all()]


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = _invoice_query(db).filter(Invoice.id == invoice_id).first()
    if invoice is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada.")
    role = current_user.rol.nombre if current_user.rol else None
    if role not in {"Administrador", "Empleado"} and invoice.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes consultar esta factura.")
    return serialize_invoice(invoice)


@router.get("/{invoice_id}/pdf", response_class=StreamingResponse, responses={200: {"content": {"application/pdf": {}}}})
def invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invoice = _invoice_query(db).filter(Invoice.id == invoice_id).first()
    if invoice is None:
        raise HTTPException(status_code=404, detail="Factura no encontrada.")
    role = current_user.rol.nombre if current_user.rol else None
    if role not in {"Administrador", "Empleado"} and invoice.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes descargar esta factura.")

    pdf_bytes = build_invoice_pdf(invoice)
    filename = f"factura-{invoice.numero_factura}.pdf"
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})

    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1.5 * cm, leftMargin=1.5 * cm, topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("GAMEZONE", styles["Title"]),
        Paragraph("FACTURA DE VENTA", styles["Heading2"]),
        Paragraph(f"Número factura: {invoice.numero_factura}", styles["Normal"]),
        Paragraph(f"Fecha: {invoice.fecha:%Y-%m-%d %H:%M}", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("DATOS DEL CLIENTE", styles["Heading3"]),
        Paragraph(f"Nombre: {invoice.cliente_nombre}", styles["Normal"]),
        Paragraph(f"Documento: {invoice.cliente_documento}", styles["Normal"]),
        Paragraph(f"Correo: {invoice.cliente_email or '-'}", styles["Normal"]),
        Spacer(1, 12),
    ]
    data = [["Producto/Servicio", "Cantidad", "Precio unitario", "Descuento", "Subtotal"]]
    for detail in invoice.detalles:
        data.append([detail.descripcion, detail.cantidad, f"${detail.precio_unitario:,.2f}", f"${detail.descuento:,.2f}", f"${detail.subtotal:,.2f}"])
    table = Table(data, repeatRows=1, colWidths=[7 * cm, 2.2 * cm, 3.3 * cm, 3 * cm, 3.3 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
    ]))
    story.extend([table, Spacer(1, 12), Paragraph(f"Subtotal: ${invoice.subtotal:,.2f}", styles["Normal"]), Paragraph(f"Descuentos: ${invoice.descuento:,.2f}", styles["Normal"]), Paragraph(f"Impuestos: ${invoice.impuestos:,.2f}", styles["Normal"]), Paragraph(f"TOTAL: ${invoice.total:,.2f}", styles["Heading3"]), Paragraph(f"Estado: {invoice.estado}", styles["Normal"])])
    document.build(story)
    buffer.seek(0)
    filename = f"factura-{invoice.numero_factura}.pdf"
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
