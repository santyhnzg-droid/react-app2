import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";
import { AdminShell } from "../../components/admin/AdminShell";

export function AdminDashboard() {
  const {
    usuario,
  } = useAuth();

  return (
    <AdminShell
      eyebrow="GameZone Admin / Resumen"
      title={`Bienvenido, ${usuario?.nombre || "Administrador"}`}
      description="Una vista rápida del estado de tu operación y sus accesos principales."
    >
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl border border-cyan-300/15 bg-cyan-300/6 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/55">Catálogo</p>
          <p className="mt-4 text-3xl font-semibold">Productos</p>
          <p className="mt-2 text-xs text-white/40">Inventario y publicaciones</p>
        </article>
        <article className="rounded-3xl border border-violet-300/15 bg-violet-300/6 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-violet-200/55">Equipo</p>
          <p className="mt-4 text-3xl font-semibold">Usuarios</p>
          <p className="mt-2 text-xs text-white/40">Roles y accesos</p>
        </article>
        <article className="rounded-3xl border border-emerald-300/15 bg-emerald-300/6 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/55">Servicios</p>
          <p className="mt-4 text-3xl font-semibold">Activos</p>
          <p className="mt-2 text-xs text-white/40">Oferta disponible</p>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">

          <Link
            to="/admin/productos"
            className="group rounded-3xl border border-white/10 bg-[#080b11]/80 p-7 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-300/5"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">
              Catálogo
            </span>

            <h2 className="mt-10 text-2xl font-semibold">
              Productos
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Crear, editar,
              activar, desactivar
              y eliminar videojuegos.
            </p>

            <span className="mt-8 block text-cyan-300 transition group-hover:translate-x-2">
              Administrar →
            </span>
          </Link>

          <Link
            to="/admin/usuarios"
            className="group rounded-3xl border border-white/10 bg-[#080b11]/80 p-7 transition hover:-translate-y-1 hover:border-violet-300/30 hover:bg-violet-300/5"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-violet-300/50">
              Seguridad
            </span>

            <h2 className="mt-10 text-2xl font-semibold">
              Usuarios
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Gestionar clientes,
              empleados y
              administradores.
            </p>

            <span className="mt-8 block text-violet-300">
              Administrar <span className="transition group-hover:translate-x-2">→</span>
            </span>
          </Link>

          <Link
            to="/admin/servicios"
            className="group rounded-3xl border border-white/10 bg-[#080b11]/80 p-7 transition hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-emerald-300/5"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-emerald-300/50">
              Plataforma
            </span>

            <h2 className="mt-10 text-2xl font-semibold">
              Servicios
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Gestionar los
              servicios disponibles
              en GameZone.
            </p>

            <span className="mt-8 block text-emerald-300">
              Administrar <span className="transition group-hover:translate-x-2">→</span>
            </span>
          </Link>

      </section>
    </AdminShell>
  );
}