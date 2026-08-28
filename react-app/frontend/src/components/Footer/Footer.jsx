import { Link } from "react-router-dom";

import logo from "../../assets/images/logo.png";
import whatsLogo from "../../assets/images/whats.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#030509] text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="h-px w-full bg-linear-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          <img
            src={logo}
            alt="GameZone"
            className="h-20 w-auto object-contain"
          />

          <p className="mt-6 max-w-lg text-base leading-7 text-white/55">
            Un espacio creado para descubrir videojuegos, explorar mundos
            increíbles y conocer experiencias que han marcado generaciones de
            jugadores.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-4 py-2 text-xs font-medium tracking-wide text-cyan-200/80">
              React
            </span>

            <span className="rounded-full border border-violet-400/15 bg-violet-400/5 px-4 py-2 text-xs font-medium tracking-wide text-violet-200/80">
              Tailwind CSS
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-white/70">
              Vite
            </span>
          </div>

        </div>

        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            Explorar
          </p>

          <ul className="space-y-4">
            <li>
              <Link
                to="/"
                className="text-sm text-white/70 transition hover:text-cyan-300"
              >
                Inicio
              </Link>
            </li>

            <li>
              <Link
                to="/quienes-somos"
                className="text-sm text-white/70 transition hover:text-cyan-300"
              >
                Quiénes somos
              </Link>
            </li>

            <li>
              <Link
                to="/contacto"
                className="text-sm text-white/70 transition hover:text-cyan-300"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            Tu cuenta
          </p>

          <ul className="space-y-4">
            <li>
              <Link
                to="/login"
                className="text-sm text-white/70 transition hover:text-violet-300"
              >
                Iniciar sesión
              </Link>
            </li>

            <li>
              <Link
                to="/recover-password"
                className="text-sm text-white/70 transition hover:text-violet-300"
              >
                Recuperar contraseña
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            Redes sociales
          </p>

          <div className="flex flex-col items-start gap-3">
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar X"
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold transition group-hover:scale-110">X</span>
              X
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar Instagram"
              className="group flex items-center gap-3 rounded-xl border border-violet-300/15 bg-violet-400/5 px-3 py-2 text-sm text-violet-200/80 transition hover:-translate-y-1 hover:border-violet-300/40 hover:bg-violet-400/10 hover:text-violet-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/10 text-lg transition group-hover:scale-110">◎</span>
              Instagram
            </a>

            <a
              href="https://wa.me/573178830925?text=Hola%20GameZone,%20necesito%20información."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="group flex items-center gap-3 rounded-xl border border-emerald-300/15 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-200/80 transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-emerald-400/10"
            >
              <img
                src={whatsLogo}
                alt=""
                className="h-7 w-7 rounded-full object-cover transition group-hover:scale-110"
              />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center md:flex-row md:text-left">
          <p className="text-xs text-white/35">
            © {currentYear} GAMEZONE. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2 text-xs text-white/30">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Sistema activo
          </div>
        </div>
      </div>
    </footer>
  );
}
