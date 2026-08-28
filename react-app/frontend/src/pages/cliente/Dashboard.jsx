import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

export function ClienteDashboard() {
  const {
    usuario,
  } = useAuth();

  return (
    <main className="min-h-screen bg-[#030509] px-6 py-12 text-white">

      <div className="mx-auto max-w-6xl">

        <header className="mb-12">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/60">
            Mi GameZone
          </p>

          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
            Hola,{" "}
            {usuario?.nombre}
          </h1>

          <p className="mt-4 text-white/40">
            Bienvenido a tu cuenta.
          </p>

        </header>

        <section className="grid gap-6 md:grid-cols-2">

          <Link
            to="/productos"
            className="group rounded-3xl border border-white/10 bg-white/[0.035] p-8 transition hover:-translate-y-1 hover:border-cyan-300/30"
          >

            <span className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">
              Biblioteca
            </span>

            <h2 className="mt-12 text-2xl font-semibold">
              Explorar juegos
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Descubre todos los
              videojuegos disponibles.
            </p>

            <span className="mt-8 block text-cyan-300">
              Ir al catálogo →
            </span>

          </Link>

          <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-8">

            <span className="text-xs uppercase tracking-[0.25em] text-violet-300/50">
              Cuenta
            </span>

            <h2 className="mt-12 text-2xl font-semibold">
              Mi perfil
            </h2>

            <dl className="mt-6 space-y-4 text-sm">

              <div>
                <dt className="text-white/30">
                  Nombre
                </dt>

                <dd className="mt-1">
                  {usuario?.nombre}{" "}
                  {usuario?.apellido}
                </dd>
              </div>

              <div>
                <dt className="text-white/30">
                  Correo
                </dt>

                <dd className="mt-1">
                  {usuario?.email}
                </dd>
              </div>

              <div>
                <dt className="text-white/30">
                  Rol
                </dt>

                <dd className="mt-1 text-cyan-300">
                  {usuario?.rol}
                </dd>
              </div>

            </dl>

          </article>

        </section>

      </div>

    </main>
  );
}