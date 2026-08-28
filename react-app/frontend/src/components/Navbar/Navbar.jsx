import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/");
  };

  const getPanelPath = () => {
    if (!usuario) return "/";

    if (usuario.rol === "Administrador") {
      return "/admin";
    }

    if (usuario.rol === "Empleado") {
      return "/empleado";
    }

    return "/cliente";
  };

  return (
    <nav className="absolute left-0 top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">

        {/* LOGO INDEPENDIENTE */}
        <Link
          to="/"
          className="group flex shrink-0 items-center transition duration-300 hover:-translate-y-0.5"
        >
          <img
            src={logo}
            alt="GameZone"
            className="h-20 w-auto object-contain transition duration-300 group-hover:scale-105 sm:h-24"
          />
        </Link>

        {/* LINKS */}
        <ul className="hidden items-center gap-1 md:flex">
          <li>
            <Link
              to="/"
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Inicio
            </Link>
          </li>

          <li>
            <Link
              to="/productos"
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Productos
            </Link>
          </li>

          <li>
            <Link
              to="/quienes-somos"
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Quiénes somos
            </Link>
          </li>

          <li>
            <Link
              to="/contacto"
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Contacto
            </Link>
          </li>
        </ul>

        {/* USUARIO / LOGIN */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              {/* USUARIO */}
              <Link
                to={getPanelPath()}
                className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 transition hover:border-cyan-300/30 hover:bg-white/[0.07] sm:flex"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-sm font-bold text-cyan-200">
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </span>

                <span>
                  <span className="block text-[10px] uppercase tracking-[0.15em] text-white/30">
                    {usuario.rol}
                  </span>

                  <span className="block text-sm font-semibold text-white/80">
                    {usuario.nombre}
                  </span>
                </span>
              </Link>

              {/* CERRAR SESIÓN */}
              <button
                type="button"
                onClick={handleLogout}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/15 bg-white/6 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:border-red-300/40 hover:bg-red-400/10"
              >
                <span className="pointer-events-none absolute left-[10%] top-0 h-px w-[80%] bg-linear-to-r from-transparent via-red-300/70 to-transparent" />

                <span className="relative z-10">
                  Salir
                </span>

                <span className="relative z-10 transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-white/8 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_10px_30px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/13 sm:px-6 sm:text-sm"
            >
              <span className="pointer-events-none absolute left-[10%] top-0 h-px w-[80%] bg-linear-to-r from-transparent via-cyan-300/80 to-violet-400/70" />

              <span className="relative z-10">
                Iniciar sesión
              </span>

              <span className="relative z-10 hidden transition-transform group-hover:translate-x-1 sm:inline">
                →
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}