import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";

export function QuienesSomos() {
  const objetivos = [
    {
      number: "01",
      title: "Explorar",
      text: "Descubrir videojuegos, mundos, personajes e historias que han marcado diferentes generaciones.",
    },
    {
      number: "02",
      title: "Innovar",
      text: "Crear una experiencia moderna, visual y responsiva utilizando tecnologías actuales.",
    },
    {
      number: "03",
      title: "Conectar",
      text: "Construir un espacio donde los jugadores puedan acercarse a nuevas experiencias y contenidos.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030509] text-white">
      <header className="relative border-b border-white/5 bg-[#05070b]">
        <Navbar />

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-40 md:pb-32">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/60">
            Sobre GameZone
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Más que videojuegos,
            <span className="bg-linear-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {" "}experiencias.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/45">
            GameZone es una plataforma creada para presentar videojuegos de
            forma moderna, dinámica y visual, combinando diseño, interacción
            y contenido multimedia.
          </p>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300/60">
              Nuestra historia
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Un proyecto pensado para jugadores
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/45">
              GameZone nace como una aplicación web enfocada en ofrecer una
              navegación clara, una identidad visual gamer y una experiencia
              responsiva en diferentes dispositivos.
            </p>

            <p className="mt-4 max-w-xl text-base leading-8 text-white/45">
              El proyecto integra React, Vite, React Router y Tailwind CSS,
              manteniendo una estructura basada en componentes reutilizables.
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl">
            <p className="text-sm text-white/35">Nuestra visión</p>

            <blockquote className="mt-4 text-2xl font-medium leading-relaxed text-white/85">
              “Crear una experiencia visual capaz de transmitir la emoción de
              cada videojuego desde el primer momento.”
            </blockquote>

            <div className="mt-8 h-px bg-linear-to-r from-cyan-300/40 via-violet-400/30 to-transparent" />
          </aside>
        </section>

        <section className="border-y border-white/5 bg-white/1.5">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/60">
                Lo que buscamos
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Nuestros objetivos
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {objetivos.map((objetivo) => (
                <article
                  key={objetivo.number}
                  className="group rounded-2xl border border-white/8 bg-white/3 p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/5"
                >
                  <span className="text-xs font-semibold tracking-[0.25em] text-white/20">
                    {objetivo.number}
                  </span>

                  <h3 className="mt-12 text-2xl font-semibold">
                    {objetivo.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/40">
                    {objetivo.text}
                  </p>

                  <div className="mt-7 h-px bg-linear-to-r from-cyan-300/30 to-transparent" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-300/60">
              GameZone
            </p>

            <h2 className="mt-5 text-4xl font-semibold md:text-6xl">
              El juego empieza con una buena experiencia.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/40">
              Diseño, contenido y tecnología trabajando juntos para construir
              una interfaz moderna y pensada para jugadores.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}