from datetime import date, datetime, time
from decimal import Decimal
from io import BytesIO

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.sale import Sale
from app.models.sale import SaleDetail
from app.models.product import Product
from app.models.report import GeneratedReport
from app.models.service import Service
from app.models.user import User
from app.schemas.report import DailySalesReportResponse


router = APIRouter(prefix="/api/reportes", tags=["Reportes"])


def _get_daily_sales(db: Session, report_date: date):
    start = datetime.combine(report_date, time.min)
    end = datetime.combine(report_date, time.max)
    return (
        db.query(Sale)
        .options(
            joinedload(Sale.cliente),
            joinedload(Sale.detalles).joinedload(SaleDetail.producto),
            joinedload(Sale.detalles).joinedload(SaleDetail.servicio),
        )
        .filter(Sale.fecha >= start, Sale.fecha <= end)
        .order_by(Sale.fecha.asc(), Sale.id.asc())
        .all()
    )


def _report_rows(sales):
    rows = []
    for sale in sales:
        client_name = None
        if sale.cliente:
            client_name = f"{sale.cliente.nombre} {sale.cliente.apellido}".strip()
        for detail in sale.detalles:
            item = detail.producto or detail.servicio
            rows.append({
                "fecha": sale.fecha,
                "venta": sale.id,
                "cliente": client_name,
                "tipo": detail.tipo,
                "producto_servicio": item.nombre if item else None,
                "cantidad": detail.cantidad,
                "precio": detail.precio_unitario,
                "subtotal": detail.subtotal,
                "total": sale.total,
                "estado": sale.estado,
            })
    return rows


def _total_sales(sales):
    """Suma cada venta una sola vez, aunque tenga varios artículos."""
    return sum((sale.total for sale in sales), Decimal("0.00"))


def _record_report(db: Session, current_user: User, fecha: date, formato: str, filename: str):
    db.add(GeneratedReport(
        usuario_id=current_user.id,
        tipo="ventas_diarias",
        formato=formato,
        fecha_inicial=fecha,
        fecha_final=fecha,
        filtros={"fecha": fecha.isoformat()},
        nombre_archivo=filename,
        ruta_archivo=None,
    ))
    db.commit()


@router.get("/ventas-diarias", response_model=DailySalesReportResponse)
def daily_sales_report(
    fecha: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    sales = _get_daily_sales(db, fecha)
    rows = _report_rows(sales)
    total_general = _total_sales(sales)
    return {"fecha": fecha, "ventas": rows, "total_general": total_general}


@router.get(
    "/ventas-diarias/pdf",
    response_class=StreamingResponse,
    responses={200: {"content": {"application/pdf": {}}}},
)
def daily_sales_pdf(
    fecha: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    sales = _get_daily_sales(db, fecha)
    rows = _report_rows(sales)
    total_general = _total_sales(sales)
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=landscape(A4), rightMargin=1.2 * cm, leftMargin=1.2 * cm, topMargin=1.2 * cm, bottomMargin=1.2 * cm)
    styles = getSampleStyleSheet()
    story = [Paragraph("GAMEZONE", styles["Title"]), Paragraph("Reporte diario de ventas", styles["Heading2"]), Paragraph(f"Fecha reporte: {fecha.isoformat()}", styles["Normal"]), Spacer(1, 12)]
    data = [["Venta", "Cliente", "Tipo", "Producto/Servicio", "Cantidad", "Precio", "Subtotal", "Estado"]]
    for row in rows:
        data.append([row["venta"], row["cliente"] or "Sin cliente", row["tipo"], row["producto_servicio"] or "-", row["cantidad"], f"${row['precio']:,.2f}", f"${row['subtotal']:,.2f}", row["estado"]])
    if not rows:
        data.append(["-", "Sin ventas", "-", "-", "-", "-", "$0.00", "-"])
    table = Table(data, repeatRows=1, colWidths=[1.3 * cm, 4.2 * cm, 2.2 * cm, 5.2 * cm, 2 * cm, 2.7 * cm, 2.7 * cm, 2.7 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (4, 1), (6, -1), "RIGHT"),
    ]))
    story.extend([table, Spacer(1, 12), Paragraph(f"TOTAL GENERAL: ${total_general:,.2f}", styles["Heading3"])])
    document.build(story)
    buffer.seek(0)
    filename = f"reporte-ventas-{fecha.isoformat()}.pdf"
    _record_report(db, current_user, fecha, "PDF", filename)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get(
    "/ventas-diarias/excel",
    response_class=StreamingResponse,
    responses={200: {"content": {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {}}}},
)
def daily_sales_excel(
    fecha: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Empleado", "Administrador")),
):
    rows = _report_rows(_get_daily_sales(db, fecha))
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Ventas diarias"
    headers = ["Fecha", "Venta", "Cliente", "Tipo", "Producto/Servicio", "Cantidad", "Precio unitario", "Subtotal", "Estado", "Total venta"]
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="111827")
        cell.alignment = Alignment(horizontal="center")
    for row in rows:
        sheet.append([
            row["fecha"], row["venta"], row["cliente"] or "Sin cliente", row["tipo"],
            row["producto_servicio"] or "-", row["cantidad"], row["precio"],
            row["subtotal"], row["estado"], row["total"],
        ])
    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions
    widths = [20, 12, 28, 14, 30, 12, 18, 16, 16, 16]
    for index, width in enumerate(widths, start=1):
        sheet.column_dimensions[chr(64 + index)].width = width
    for row in sheet.iter_rows(min_row=2, min_col=7, max_col=8):
        for cell in row:
            cell.number_format = '[$$-es-CO] #,##0.00'
    for cell in sheet["J"][1:]:
        cell.number_format = '[$$-es-CO] #,##0.00'

    total_row = sheet.max_row + 2
    sheet.cell(total_row, 9, "TOTAL GENERAL")
    sheet.cell(total_row, 9).font = Font(bold=True)
    sheet.cell(total_row, 10, sum((row["total"] for row in rows), 0))
    sheet.cell(total_row, 10).font = Font(bold=True)
    sheet.cell(total_row, 10).number_format = '[$$-es-CO] #,##0.00'

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)
    filename = f"reporte-ventas-{fecha.isoformat()}.xlsx"
    _record_report(db, current_user, fecha, "XLSX", filename)
    return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
