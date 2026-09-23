"""Correo transaccional de GameZone.

El envío es opcional: si SMTP no está configurado, la aplicación continúa
funcionando y deja una advertencia en los logs. Esto evita que un problema
temporal del proveedor de correo anule una compra confirmada.
"""

from email.message import EmailMessage
from html import escape
from io import BytesIO
import logging
import smtplib

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.config import settings
from app.services.invoice_pdf import build_invoice_pdf


logger = logging.getLogger(__name__)


def _configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM)


def _send(message: EmailMessage) -> bool:
    if not _configured():
        logger.warning("Correo no enviado: configura SMTP_HOST y SMTP_FROM en backend/.env")
        return False
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        return True
    except Exception:
        logger.exception("No fue posible enviar el correo transaccional")
        return False


def _message(to: str, subject: str, title: str, intro: str, body: str) -> EmailMessage:
    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(f"{title}\n\n{intro}\n\n{body}\n\nEquipo GameZone")
    message.add_alternative(f"""
    <!doctype html><html lang="es"><body style="margin:0;background:#05060b;color:#e5e7eb;font-family:Arial,sans-serif">
      <div style="max-width:620px;margin:32px auto;padding:8px">
        <div style="border:1px solid #24304a;border-radius:22px;overflow:hidden;background:#0c1020;box-shadow:0 20px 50px #0008">
          <div style="padding:30px 34px;background:linear-gradient(135deg,#17112f,#071827);border-bottom:1px solid #26324d">
            <div style="font-size:13px;font-weight:bold;letter-spacing:4px;color:#67e8f9">GAMEZONE</div>
            <h1 style="margin:22px 0 8px;color:#fff;font-size:28px">{title}</h1>
            <p style="margin:0;color:#a5b4fc;line-height:1.6">{intro}</p>
          </div>
          <div style="padding:30px 34px;line-height:1.7;color:#cbd5e1">{body}</div>
          <div style="padding:22px 34px;border-top:1px solid #202b43;color:#64748b;font-size:12px;line-height:1.6">
            Este correo fue enviado automáticamente por GameZone. Si no reconoces esta actividad, contacta a soporte.
          </div>
        </div>
      </div>
    </body></html>
    """, subtype="html")
    return message


def send_password_recovery(email: str, name: str, token: str) -> bool:
    link = f"{settings.FRONTEND_URL.rstrip('/')}/recover-password?token={token}"
    body = f"""
      <p>Hola <strong style="color:#fff">{escape(name)}</strong>,</p>
      <p>Recibimos una solicitud para actualizar la contraseña de tu cuenta.</p>
      <p style="margin:28px 0"><a href="{escape(link)}" style="display:inline-block;padding:14px 22px;border-radius:12px;background:#67e8f9;color:#071827;text-decoration:none;font-weight:bold">Actualizar contraseña</a></p>
      <p style="font-size:13px;color:#94a3b8">Este enlace vence en 15 minutos y solo puede utilizarse una vez. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    """
    return _send(_message(email, "Actualiza tu contraseña | GameZone", "Actualización de contraseña", "Protege tu cuenta en unos segundos.", body))


def send_password_changed(email: str, name: str) -> bool:
    body = f"<p>Hola <strong style=\"color:#fff\">{escape(name)}</strong>,</p><p>Tu contraseña de GameZone fue actualizada correctamente.</p><p>Si no realizaste este cambio, contacta inmediatamente a soporte.</p>"
    return _send(_message(email, "Tu contraseña fue actualizada | GameZone", "Contraseña actualizada", "Tu cuenta está protegida.", body))


def send_welcome(email: str, name: str, role: str | None) -> bool:
    body = f"<p>Hola <strong style=\"color:#fff\">{escape(name)}</strong>,</p><p>Nos alegra tenerte en GameZone. Tu cuenta ya está lista para explorar nuestro catálogo y disfrutar tu próxima compra.</p><p style=\"margin-top:24px\"><a href=\"{escape(settings.FRONTEND_URL)}\" style=\"display:inline-block;padding:14px 22px;border-radius:12px;background:#a78bfa;color:#100b22;text-decoration:none;font-weight:bold\">Entrar a GameZone</a></p>"
    return _send(_message(email, "Bienvenido a GameZone", "¡Bienvenido a GameZone!", f"Tu cuenta como {role or 'cliente'} está activa.", body))


def invoice_pdf(invoice) -> bytes:
    return build_invoice_pdf(invoice)

    # Código legado conservado abajo para compatibilidad con instalaciones
    # antiguas; la factura entregada usa siempre el generador profesional.
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1.5 * cm, leftMargin=1.5 * cm, topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    story = [Paragraph("GAMEZONE", styles["Title"]), Paragraph("COMPROBANTE DE COMPRA", styles["Heading2"]), Paragraph(f"Número: {invoice.numero_factura}", styles["Normal"]), Paragraph(f"Fecha: {invoice.fecha:%Y-%m-%d %H:%M}", styles["Normal"]), Spacer(1, 12), Paragraph(f"Cliente: {invoice.cliente_nombre}", styles["Normal"]), Paragraph(f"Correo: {invoice.cliente_email or '-'}", styles["Normal"]), Spacer(1, 12)]
    data = [["Artículo", "Cantidad", "Precio", "Subtotal"]]
    for detail in invoice.detalles:
        data.append([detail.descripcion, detail.cantidad, f"${detail.precio_unitario:,.2f}", f"${detail.subtotal:,.2f}"])
    table = Table(data, repeatRows=1, colWidths=[9 * cm, 2.5 * cm, 3.2 * cm, 3.2 * cm])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), .25, colors.HexColor("#CBD5E1")), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]), ("FONTSIZE", (0, 0), (-1, -1), 8)]))
    story.extend([table, Spacer(1, 12), Paragraph(f"Subtotal: ${invoice.subtotal:,.2f}", styles["Normal"]), Paragraph(f"Descuentos: ${invoice.descuento:,.2f}", styles["Normal"]), Paragraph(f"Impuestos: ${invoice.impuestos:,.2f}", styles["Normal"]), Paragraph(f"TOTAL: ${invoice.total:,.2f} {invoice.moneda}", styles["Heading3"])])
    document.build(story)
    return buffer.getvalue()


def send_invoice_email(invoice) -> bool:
    details = "".join(f"<tr><td style='padding:10px 0;border-bottom:1px solid #24304a'>{escape(detail.descripcion)} × {detail.cantidad}</td><td style='padding:10px 0;border-bottom:1px solid #24304a;text-align:right'>${detail.subtotal:,.2f}</td></tr>" for detail in invoice.detalles)
    body = f"<p>Hola <strong style=\"color:#fff\">{escape(invoice.cliente_nombre)}</strong>,</p><p>Gracias por comprar en GameZone. Tu pago fue confirmado correctamente.</p><table style=\"width:100%;margin:22px 0;border-collapse:collapse;color:#cbd5e1\"><tr><td style=\"padding:10px 0;color:#67e8f9\">Comprobante {escape(invoice.numero_factura)}</td><td style=\"padding:10px 0;text-align:right\">{invoice.fecha:%d/%m/%Y}</td></tr>{details}<tr><td style=\"padding-top:18px;font-weight:bold;color:#fff\">Total</td><td style=\"padding-top:18px;text-align:right;font-weight:bold;color:#67e8f9\">${invoice.total:,.2f} {invoice.moneda}</td></tr></table><p>Adjuntamos tu comprobante en formato PDF para que lo conserves.</p>"
    message = _message(invoice.cliente_email, f"Comprobante de compra {invoice.numero_factura} | GameZone", "Compra confirmada", "Tu comprobante ya está disponible.", body)
    message.add_attachment(invoice_pdf(invoice), maintype="application", subtype="pdf", filename=f"comprobante-{invoice.numero_factura}.pdf")
    return _send(message)
