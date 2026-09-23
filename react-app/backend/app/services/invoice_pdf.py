from pathlib import Path
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.config import settings


def build_invoice_pdf(invoice) -> bytes:
    """Genera una factura legible y lista para entregar al cliente."""
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.4 * cm,
        leftMargin=1.4 * cm,
        topMargin=1.2 * cm,
        bottomMargin=1.2 * cm,
    )
    styles = getSampleStyleSheet()
    logo_path = Path(__file__).resolve().parents[2] / "uploads" / "products" / "logo.png"
    logo = Image(str(logo_path), width=3.5 * cm, height=1.45 * cm) if logo_path.exists() else Paragraph(settings.BUSINESS_NAME, styles["Title"])
    company = Paragraph(
        f"<b>{settings.BUSINESS_NAME}</b><br/>NIT: {settings.BUSINESS_NIT}<br/>{settings.BUSINESS_ADDRESS}<br/>{settings.BUSINESS_PHONE}<br/>{settings.BUSINESS_EMAIL}",
        styles["Normal"],
    )
    title = Paragraph("<b>FACTURA DE VENTA</b>", styles["Heading2"])
    header = Table([[logo, company, title]], colWidths=[4.2 * cm, 8.3 * cm, 5 * cm])
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 1, colors.HexColor("#06B6D4")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story = [
        header,
        Spacer(1, 10),
        Paragraph(f"<b>Número:</b> {invoice.numero_factura} &nbsp;&nbsp; <b>Fecha:</b> {invoice.fecha:%Y-%m-%d %H:%M} &nbsp;&nbsp; <b>Estado:</b> {invoice.estado}", styles["Normal"]),
        Spacer(1, 10),
        Paragraph("<b>DATOS DEL CLIENTE</b>", styles["Heading3"]),
        Paragraph(f"Nombre: {invoice.cliente_nombre}<br/>Documento: {invoice.cliente_documento}<br/>Correo: {invoice.cliente_email or '-'}", styles["Normal"]),
        Spacer(1, 12),
    ]
    data = [["Artículo / servicio", "Cantidad", "Precio unitario", "Descuento", "Subtotal"]]
    for detail in invoice.detalles:
        data.append([detail.descripcion, detail.cantidad, f"${detail.precio_unitario:,.2f}", f"${detail.descuento:,.2f}", f"${detail.subtotal:,.2f}"])
    table = Table(data, repeatRows=1, colWidths=[7 * cm, 2.2 * cm, 3.2 * cm, 2.8 * cm, 3.2 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
    ]))
    story.extend([
        table,
        Spacer(1, 12),
        Paragraph(f"Subtotal: ${invoice.subtotal:,.2f}", styles["Normal"]),
        Paragraph(f"Descuentos: ${invoice.descuento:,.2f}", styles["Normal"]),
        Paragraph(f"IVA ({settings.IVA_RATE}%): ${invoice.impuestos:,.2f}", styles["Normal"]),
        Paragraph(f"<b>TOTAL A PAGAR: ${invoice.total:,.2f} {invoice.moneda}</b>", styles["Heading3"]),
        Spacer(1, 18),
        Paragraph("Gracias por elegir GameZone. Conserve este documento como soporte de su compra.", styles["Normal"]),
    ])
    document.build(story)
    return buffer.getvalue()
