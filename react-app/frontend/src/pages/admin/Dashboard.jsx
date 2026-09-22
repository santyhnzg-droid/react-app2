import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AdminShell } from "../../components/admin/AdminShell";
import { getAdminDashboard } from "../../services/api";
import { useAuth } from "../../context/AuthContext";


const cards = [
  ["total_usuarios", "Usuarios", "Cuentas registradas", "cyan"],
  ["productos_activos", "Productos activos", "Catálogo disponible", "violet"],
  ["servicios_activos", "Servicios activos", "Oferta publicada", "emerald"],
  ["total_ventas", "Ventas", "Operaciones registradas", "amber"],
  ["total_facturas", "Facturas", "Documentos emitidos", "sky"],
  ["total_pqr", "PQR", "Solicitudes recibidas", "rose"],
  ["pqr_pendientes", "PQR pendientes", "Requieren seguimiento", "orange"],
];


function money(value) {
  return `$${Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
}


export function AdminDashboard() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <AdminShell eyebrow="GameZone Admin / Resumen" title={`Bienvenido, ${usuario?.nombre || "Administrador"}`} description="Indicadores en tiempo real alimentados por FastAPI y PostgreSQL.">
      {error && <div className="mb-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, label, description]) => <article key={key} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/60">{label}</p><p className="mt-4 text-3xl font-semibold">{data ? data[key] ?? 0 : "—"}</p><p className="mt-2 text-xs text-white/40">{description}</p></article>)}
        <article className="rounded-3xl border border-emerald-300/15 bg-emerald-300/6 p-5"><p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/60">Valor ventas</p><p className="mt-4 text-3xl font-semibold">{data ? money(data.valor_ventas) : "—"}</p><p className="mt-2 text-xs text-white/40">Total de ventas</p></article>
        <article className="rounded-3xl border border-cyan-300/15 bg-cyan-300/6 p-5"><p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/60">Facturación</p><p className="mt-4 text-3xl font-semibold">{data ? money(data.total_facturacion) : "—"}</p><p className="mt-2 text-xs text-white/40">Facturas no anuladas</p></article>
      </section>
      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {[['/admin/productos','Productos','Gestionar catálogo'], ['/admin/usuarios','Usuarios','Gestionar roles y accesos'], ['/ventas/dashboard','Dashboard de ventas','Analizar métricas y gráficos'], ['/ventas/historial','Historial de ventas','Consultar y exportar reportes'], ['/facturas','Facturación','Generar y descargar facturas'], ['/admin/servicios','Servicios','Gestionar servicios']].map(([path, title, description]) => <Link key={path} to={path} className="group rounded-3xl border border-white/10 bg-[#080b11]/80 p-6 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/5"><span className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">GameZone</span><h2 className="mt-6 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-white/40">{description}</p><span className="mt-6 block text-cyan-300">Abrir →</span></Link>)}
      </section>
    </AdminShell>
  );
}
