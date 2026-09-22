import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

const adminNavigation = [
  { label: "Resumen", path: "/admin", mark: "01" },
  { label: "Productos", path: "/admin/productos", mark: "02" },
  { label: "Usuarios", path: "/admin/usuarios", mark: "03" },
  { label: "Servicios", path: "/admin/servicios", mark: "04" },
  { label: "Historial de ventas", path: "/ventas/historial", mark: "05" },
  { label: "Facturación", path: "/facturas", mark: "06" },
  { label: "Dashboard de ventas", path: "/ventas/dashboard", mark: "07" },
  { label: "Gestión PQR", path: "/admin/pqr", mark: "08" },
];

const employeeNavigation = [
  { label: "Caja de ventas", path: "/empleado", mark: "01" },
  { label: "Historial de ventas", path: "/ventas/historial", mark: "02" },
  { label: "Facturación", path: "/facturas", mark: "03" },
  { label: "Dashboard de ventas", path: "/ventas/dashboard", mark: "04" },
  { label: "PQR", path: "/admin/pqr", mark: "05" },
  { label: "Catálogo público", path: "/productos", mark: "06" },
];

export function AdminShell({ eyebrow, title, description, children }) {
  const location = useLocation();
  const { usuario, cerrarSesion } = useAuth();
  const navigation = usuario?.rol === "Administrador"
    ? adminNavigation
    : employeeNavigation;

  return (
    <main className="min-h-screen bg-[#030509] text-white selection:bg-cyan-300/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-48 top-20 h-96 w-96 rounded-full bg-cyan-400/6 blur-[120px]" />
        <div className="absolute -right-48 bottom-0 h-128 w-lg rounded-full bg-violet-600/6 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-size-[42px_42px] opacity-30" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-5 p-4 sm:p-6 lg:p-8">
        <aside className="hidden w-64 shrink-0 flex-col rounded-3xl border border-white/10 bg-[#080b11]/85 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:flex">
          <Link to="/" className="group flex items-center gap-3 border-b border-white/10 pb-6">
            <img
              src={logo}
              alt="GameZone"
              className="h-12 w-auto object-contain transition duration-300 group-hover:scale-105"
            />
            <span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/35">Control center</span>
            </span>
          </Link>

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">Administración</p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${active ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" : "bg-white/20 group-hover:bg-white/50"}`} />
                      {item.label}
                    </span>
                    <span className="text-[10px] text-white/20">{item.mark}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 pt-5">
            <Link to="/" className="flex items-center justify-between rounded-2xl px-3 py-3 text-xs text-white/40 transition hover:bg-white/5 hover:text-white">
              <span>Volver al sitio</span>
              <span className="text-cyan-300">↗</span>
            </Link>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.035] p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10 text-xs font-bold text-violet-200">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
              <span className="min-w-0">
                <strong className="block truncate text-xs text-white/80">{usuario?.nombre}</strong>
                <span className="block truncate text-[10px] text-white/35">{usuario?.rol}</span>
              </span>
            </div>
            <button type="button" onClick={() => { cerrarSesion(); window.location.assign("/login"); }} className="mt-3 flex w-full items-center justify-between rounded-2xl border border-rose-300/15 bg-rose-400/[0.06] px-3 py-3 text-xs text-rose-100/80 transition hover:bg-rose-400/15 hover:text-white">
              <span>Cerrar sesión</span>
              <span>↪</span>
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-6 rounded-3xl border border-white/10 bg-[#080b11]/70 px-5 py-6 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:px-8 sm:py-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-4 flex items-center gap-3 lg:hidden">
                  <Link to="/admin" className="group flex items-center gap-3">
                    <img src={logo} alt="GameZone" className="h-9 w-auto object-contain transition group-hover:scale-105" />
                  </Link>
                  <span className="text-white/20">/</span>
                  <span className="text-xs text-white/40">Admin</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300/65">{eyebrow}</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">{description}</p>}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/35">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
                Sistema operativo
              </div>
            </div>
            <nav className="mt-6 flex gap-2 overflow-x-auto border-t border-white/10 pt-4 lg:hidden">
              {navigation.map((item) => (
                <Link key={item.path} to={item.path} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs ${location.pathname === item.path ? "bg-cyan-300/10 text-cyan-200" : "text-white/45"}`}>{item.label}</Link>
              ))}
            </nav>
            <button type="button" onClick={() => { cerrarSesion(); window.location.assign("/login"); }} className="mt-5 w-full rounded-xl border border-rose-300/15 bg-rose-400/[0.06] px-4 py-3 text-left text-xs text-rose-100/80 transition hover:bg-rose-400/15 hover:text-white lg:hidden">
              Cerrar sesión
            </button>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
