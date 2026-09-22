import { useCallback, useEffect, useState } from "react";

import { AdminShell } from "../../components/admin/AdminShell";
import { crearFactura, descargarFacturaPdf, getFacturas } from "../../services/api";


export function FacturasAdmin() {
  const [facturas, setFacturas] = useState([]);
  const [ventaId, setVentaId] = useState("");
  const [filters, setFilters] = useState({ numero_factura: "", fecha_inicio: "", fecha_fin: "", estado: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setFacturas(await getFacturas(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate() {
    if (!ventaId) return;
    setError("");
    setMessage("");
    try {
      const result = await crearFactura(Number(ventaId));
      setMessage(`Factura ${result.numero_factura} generada correctamente.`);
      setVentaId("");
      await loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminShell eyebrow="GameZone / Facturación" title="Facturas" description="Genera facturas desde ventas existentes y descarga documentos PDF reales.">
      <div className="space-y-5">
        <section className="rounded-3xl border border-white/10 bg-[#080b11]/80 p-5 backdrop-blur-xl sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/65">Nueva factura</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="number" min="1" value={ventaId} onChange={(event) => setVentaId(event.target.value)} placeholder="ID de la venta" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />
            <button type="button" onClick={handleCreate} disabled={!ventaId} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#031016] disabled:opacity-40">Generar factura</button>
          </div>
        </section>

        {message && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div>}
        {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

        <section className="rounded-3xl border border-white/10 bg-[#080b11]/80 p-5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs text-white/45">Número<input name="numero_factura" value={filters.numero_factura} onChange={updateFilter} className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label>
            <label className="text-xs text-white/45">Desde<input name="fecha_inicio" type="date" value={filters.fecha_inicio} onChange={updateFilter} className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label>
            <label className="text-xs text-white/45">Hasta<input name="fecha_fin" type="date" value={filters.fecha_fin} onChange={updateFilter} className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label>
            <label className="text-xs text-white/45">Estado<select name="estado" value={filters.estado} onChange={updateFilter} className="mt-2 rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white"><option value="">Todos</option><option value="emitida">Emitida</option><option value="pagada">Pagada</option><option value="anulada">Anulada</option></select></label>
            <button type="button" onClick={loadInvoices} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/10">Filtrar</button>
          </div>
          <div className="mt-6 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-[10px] uppercase tracking-[0.15em] text-white/35"><tr><th className="px-3 py-3">Número</th><th className="px-3 py-3">Fecha</th><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">Acción</th></tr></thead><tbody className="divide-y divide-white/5">{facturas.map((invoice) => <tr key={invoice.id} className="text-white/70"><td className="px-3 py-4 font-bold text-cyan-200">{invoice.numero_factura}</td><td className="px-3 py-4">{new Date(invoice.fecha).toLocaleDateString("es-CO")}</td><td className="px-3 py-4">{invoice.cliente_nombre}</td><td className="px-3 py-4">{invoice.estado}</td><td className="px-3 py-4 text-right font-bold text-white">${Number(invoice.total || 0).toLocaleString("es-CO")}</td><td className="px-3 py-4"><button type="button" onClick={() => descargarFacturaPdf(invoice.id, invoice.numero_factura).catch((err) => setError(err.message))} className="rounded-lg border border-violet-200/20 px-3 py-2 text-xs text-violet-100 hover:bg-violet-300/10">Descargar PDF</button></td></tr>)}{!loading && !facturas.length && <tr><td colSpan="6" className="px-3 py-10 text-center text-white/35">No hay facturas para mostrar.</td></tr>}</tbody></table></div>
        </section>
      </div>
    </AdminShell>
  );
}

export default FacturasAdmin;
