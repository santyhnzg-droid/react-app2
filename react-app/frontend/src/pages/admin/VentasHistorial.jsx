import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminShell } from "../../components/admin/AdminShell";
import {
  descargarReporteVentasDiariasPdf,
  getProductos,
  getReporteVentasDiarias,
  getServicios,
  getVentas,
} from "../../services/api";


const today = new Date().toISOString().slice(0, 10);


function money(value) {
  return `$${Number(value || 0).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


export function VentasHistorial() {
  const [filters, setFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    cliente_id: "",
    producto_id: "",
    servicio_id: "",
    estado: "",
    valor_minimo: "",
    valor_maximo: "",
  });
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [reportDate, setReportDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  const loadCatalogs = useCallback(async () => {
    try {
      const [productsResult, servicesResult] = await Promise.all([
        getProductos(),
        getServicios(),
      ]);
      setProductos(productsResult.productos || []);
      setServicios(servicesResult.servicios || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getVentas(filters);
      setVentas(Array.isArray(result) ? result : result.ventas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDailyReport = useCallback(async () => {
    setReportLoading(true);
    setError("");
    try {
      setReport(await getReporteVentasDiarias(reportDate));
    } catch (err) {
      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  }, [reportDate]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    loadDailyReport();
  }, [loadDailyReport]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters({
      fecha_inicio: "",
      fecha_fin: "",
      cliente_id: "",
      producto_id: "",
      servicio_id: "",
      estado: "",
      valor_minimo: "",
      valor_maximo: "",
    });
  }

  return (
    <AdminShell
      eyebrow="GameZone / Ventas"
      title="Historial de ventas"
      description="Consulta ventas reales de PostgreSQL y genera el reporte diario en PDF."
    >
      <div className="space-y-5">
        <section className="rounded-3xl border border-white/10 bg-[#080b11]/80 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/65">Filtros dinámicos</p>
              <h2 className="mt-2 text-2xl font-semibold">Historial administrativo</h2>
              <p className="mt-2 text-sm text-white/40">{activeFilterCount} filtros activos · datos consultados en FastAPI</p>
            </div>
            <button type="button" onClick={clearFilters} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white">Limpiar filtros</button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[["fecha_inicio", "Fecha inicial", "date"], ["fecha_fin", "Fecha final", "date"], ["cliente_id", "ID cliente", "number"], ["valor_minimo", "Valor mínimo", "number"], ["valor_maximo", "Valor máximo", "number"]].map(([name, label, type]) => (
              <label key={name} className="text-xs text-white/45">
                {label}
                <input name={name} type={type} value={filters[name]} onChange={updateFilter} min={type === "number" ? "0" : undefined} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-300/50" />
              </label>
            ))}
            <label className="text-xs text-white/45">Producto<select name="producto_id" value={filters.producto_id} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/50"><option value="">Todos</option>{productos.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.nombre}</option>)}</select></label>
            <label className="text-xs text-white/45">Servicio<select name="servicio_id" value={filters.servicio_id} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/50"><option value="">Todos</option>{servicios.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.nombre}</option>)}</select></label>
            <label className="text-xs text-white/45">Estado<select name="estado" value={filters.estado} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/50"><option value="">Todos</option><option value="pendiente">Pendiente</option><option value="pagada">Pagada</option><option value="cancelada">Cancelada</option><option value="reembolsada">Reembolsada</option></select></label>
          </div>
          <button type="button" onClick={loadSales} disabled={loading} className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#031016] transition hover:bg-cyan-200 disabled:opacity-50">{loading ? "Consultando..." : "Aplicar filtros"}</button>
        </section>

        {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#080b11]/80 shadow-2xl shadow-black/10 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7"><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">Resultados</p><h2 className="mt-2 text-xl font-semibold">{ventas.length} ventas encontradas</h2></div>
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.15em] text-white/35"><tr><th className="px-5 py-4">Venta</th><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Productos / servicios</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Subtotal</th><th className="px-5 py-4 text-right">Total</th></tr></thead><tbody className="divide-y divide-white/5">{ventas.map((sale) => <tr key={sale.id} className="text-white/70"><td className="px-5 py-4 font-bold text-cyan-200">#{sale.id}</td><td className="whitespace-nowrap px-5 py-4">{new Date(sale.fecha).toLocaleString("es-CO")}</td><td className="px-5 py-4">{sale.detalles?.map((detail) => `${detail.nombre || detail.tipo} × ${detail.cantidad}`).join(", ") || "Sin detalle"}</td><td className="px-5 py-4"><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">{sale.estado}</span></td><td className="px-5 py-4 text-right">{money(sale.subtotal)}</td><td className="px-5 py-4 text-right font-bold text-white">{money(sale.total)}</td></tr>)}{!loading && !ventas.length && <tr><td colSpan="6" className="px-5 py-12 text-center text-white/35">No hay ventas para los filtros seleccionados.</td></tr>}</tbody></table></div>
        </section>

        <section className="rounded-3xl border border-violet-300/15 bg-violet-400/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-200/70">Fase 7 / Fase 8</p><h2 className="mt-2 text-2xl font-semibold">Reporte diario</h2><p className="mt-2 text-sm text-white/45">Genera datos consultados desde PostgreSQL y exporta un PDF real.</p></div><div className="flex flex-wrap gap-2"><input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /><button type="button" onClick={loadDailyReport} disabled={reportLoading} className="rounded-xl border border-violet-200/20 bg-violet-300/10 px-4 py-3 text-sm font-bold text-violet-100 hover:bg-violet-300/20">{reportLoading ? "Cargando..." : "Consultar"}</button><button type="button" onClick={() => descargarReporteVentasDiariasPdf(reportDate).catch((err) => setError(err.message))} className="rounded-xl bg-violet-300 px-4 py-3 text-sm font-bold text-[#160b25] hover:bg-violet-200">Exportar PDF</button></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs text-white/40">Fecha</p><p className="mt-2 font-bold">{report?.fecha || reportDate}</p></div><div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs text-white/40">Filas del reporte</p><p className="mt-2 text-2xl font-black">{report?.ventas?.length || 0}</p></div><div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs text-white/40">Total general</p><p className="mt-2 text-2xl font-black text-violet-100">{money(report?.total_general)}</p></div></div>
        </section>
      </div>
    </AdminShell>
  );
}

export default VentasHistorial;
