import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminShell } from "../../components/admin/AdminShell";
import { getProductos, getSalesDashboard, getServicios } from "../../services/api";

function money(value) {
  return `$${Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">{label}</p>
      {payload.map((item) => <p key={item.dataKey} className="flex items-center gap-2 text-sm font-bold text-white"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}: {money(item.value)}</p>)}
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/35">Aún no hay ventas para mostrar.</div>;
}

export function VentasDashboard() {
  const [filters, setFilters] = useState({ fecha_inicio: "", fecha_fin: "", producto_id: "", servicio_id: "", cliente_id: "", estado: "" });
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getProductos(), getServicios()]).then(([productResult, serviceResult]) => {
      setProducts(productResult.productos || []);
      setServices(serviceResult.servicios || []);
    }).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getSalesDashboard(filters).then(setData).catch((err) => setError(err.message));
  }, [filters]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  const metricCards = [
    ["Ventas", data?.total_ventas ?? 0, "Operaciones registradas", "cyan"],
    ["Ingresos", money(data?.total_facturado), "Facturación acumulada", "violet"],
    ["Ticket promedio", money(data?.ticket_promedio), "Valor promedio por venta", "emerald"],
  ];

  return (
    <AdminShell eyebrow="GameZone / Analytics" title="Dashboard de ventas" description="Métricas, tendencias y productos más vendidos consultados directamente desde PostgreSQL.">
      {error && <div className="mb-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
      <section className="rounded-3xl border border-white/10 bg-[#080b11]/80 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/60">Filtros</p><h2 className="mt-2 text-lg font-black text-white">Personaliza el reporte</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">Actualización automática</span></div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <label className="text-xs text-white/45">Desde<input name="fecha_inicio" type="date" value={filters.fecha_inicio} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label>
          <label className="text-xs text-white/45">Hasta<input name="fecha_fin" type="date" value={filters.fecha_fin} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label>
          <label className="text-xs text-white/45">Producto<select name="producto_id" value={filters.producto_id} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white"><option value="">Todos</option>{products.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
          <label className="text-xs text-white/45">Servicio<select name="servicio_id" value={filters.servicio_id} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white"><option value="">Todos</option>{services.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
          <label className="text-xs text-white/45">Cliente ID<input name="cliente_id" type="number" min="1" value={filters.cliente_id} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label>
          <label className="text-xs text-white/45">Estado<select name="estado" value={filters.estado} onChange={updateFilter} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white"><option value="">Todos</option><option value="pendiente">Pendiente</option><option value="pagada">Pagada</option><option value="cancelada">Cancelada</option><option value="reembolsada">Reembolsada</option></select></label>
        </div>
      </section>
      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        {metricCards.map(([label, value, caption, color]) => <article key={label} className={`rounded-3xl border p-5 shadow-xl ${color === "cyan" ? "border-cyan-300/20 bg-cyan-300/[0.07]" : color === "violet" ? "border-violet-300/20 bg-violet-300/[0.07]" : "border-emerald-300/20 bg-emerald-300/[0.07]"}`}><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">{label}</p><p className="mt-3 text-3xl font-black text-white">{value}</p><p className="mt-2 text-xs text-white/35">{caption}</p></article>)}
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-cyan-300/15 bg-linear-to-br from-cyan-300/[0.08] to-[#080b11]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200/55">Rendimiento</p><h2 className="mt-2 text-xl font-black text-white">Ventas por día</h2></div><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">Ingresos</span></div>
          <div className="h-80">{data?.ventas_por_dia?.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.ventas_por_dia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#ffffff12" /><XAxis dataKey="fecha" tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `$${Number(value).toLocaleString("es-CO")}`} tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} width={74} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#67e8f9" strokeWidth={3} fill="url(#salesFill)" /></AreaChart></ResponsiveContainer> : <EmptyChart />}</div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-violet-300/15 bg-linear-to-br from-violet-300/[0.08] to-[#080b11]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-200/55">Tendencia</p><h2 className="mt-2 text-xl font-black text-white">Ventas por mes</h2></div><span className="rounded-full bg-violet-300/10 px-3 py-1 text-xs font-bold text-violet-200">Comparativo</span></div>
          <div className="h-80">{data?.ventas_por_mes?.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.ventas_por_mes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><CartesianGrid vertical={false} stroke="#ffffff12" /><XAxis dataKey="mes" tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `$${Number(value).toLocaleString("es-CO")}`} tick={{ fill: "#ffffff55", fontSize: 11 }} axisLine={false} tickLine={false} width={74} /><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ color: "#ffffff66", fontSize: 12, paddingTop: 12 }} /><Bar dataKey="ingresos" name="Ingresos" fill="#a78bfa" radius={[8, 8, 2, 2]} maxBarSize={42} /></BarChart></ResponsiveContainer> : <EmptyChart />}</div>
        </article>
      </section>
    </AdminShell>
  );
}

export default VentasDashboard;
