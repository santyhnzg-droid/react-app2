import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { Carrusel } from "../components/Carrusel/Carrusel";
import { Footer } from "../components/Footer/Footer";
import ghostImage from "../assets/images/ghost.png";
import thelastImage from "../assets/images/thelast.jpg";
import gowImage from "../assets/images/Gow.jpg";

export function Inicio() {
  const juegosDestacados = [
    {
      id: 1,
      number: "01",
      title: "Ghost of Tsushima",
      image: ghostImage,
      description:
        "Honor, sacrificio y una isla marcada por la guerra.",
    },
    {
      id: 4,
      number: "02",
      title: "The Last of Us",
      image: thelastImage,
      description:
        "Sobrevive en un mundo devastado y descubre una historia inolvidable.",
    },
    {
      id: 2,
      number: "03",
      title: "God of War",
      image: gowImage,
      description:
        "Enfrenta dioses, criaturas y un destino imposible de ignorar.",
    },
  ];

  const objetivos = [
    {
      number: "01",
      title: "Explorar",
      description:
        "Descubre mundos, personajes e historias que han definido algunas de las experiencias más importantes del gaming.",
    },
    {
      number: "02",
      title: "Conocer",
      description:
        "Encuentra contenido visual y descubre qué hace especial a cada videojuego.",
    },
    {
      number: "03",
      title: "Conectar",
      description:
        "Disfruta una experiencia moderna creada para acercarte a nuevas aventuras y universos.",
    },
  ];

  return (
    <div className="overflow-hidden bg-[#030509] text-white">
      <header className="relative">
        <Navbar />
        <Carrusel />
      </header>

      <main>

        <section
          id="games"
          className="relative overflow-hidden px-6 py-24 md:py-32"
        > 

          <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[130px]" />

          <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-600/[0.07] blur-[130px]" />

          <div className="relative mx-auto max-w-7xl">
            {/* HEADER */}

            <header className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/60">
                  Descubre
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
                  Mundos que te esperan.
                </h2>
              </div>

              <p className="max-w-lg text-sm leading-7 text-white/40 md:text-right">
                Cada videojuego tiene su propio universo, su historia y una
                forma diferente de vivir una aventura.
              </p>
            </header>

            {/* CARDS */}

            <div className="grid gap-5 md:grid-cols-3">
              {juegosDestacados.map((juego) => (
                <article
                  key={juego.number}
                  className="group relative h-135 overflow-hidden rounded-2xl border border-white/8 bg-black md:h-155"
                >
                  {/* IMAGEN */}

                  <img
                    src={juego.image}
                    alt={juego.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />

                  {/* SOMBRA PRINCIPAL */}

                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/10 to-black/10" />

                  {/* SOMBRA HOVER */}

                  <div className="absolute inset-0 bg-linear-to-t from-cyan-950/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                  {/* NÚMERO */}

                  <span className="absolute left-7 top-7 z-10 text-xs font-semibold tracking-[0.3em] text-white/45">
                    {juego.number}
                  </span>

                  {/* CONTENIDO */}

                  <div className="absolute inset-x-0 bottom-0 z-10 p-7 md:p-8">
                    <h3 className="max-w-sm text-3xl font-medium tracking-tight md:text-4xl">
                      {juego.title}
                    </h3>

                    <p className="mt-4 max-w-sm translate-y-3 text-sm leading-6 text-white/0 transition duration-300 group-hover:translate-y-0 group-hover:text-white/60">
                      {juego.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="h-px w-10 bg-white/35 transition-all duration-300 group-hover:w-20 group-hover:bg-cyan-300" />

                      <Link
                        to={`/productos/${juego.id}`}
                        className="translate-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/0 transition duration-300 group-hover:translate-y-0 group-hover:text-cyan-200"
                      >
                        Explorar →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================
            PRESENTACIÓN
        ========================= */}

        <section className="relative overflow-hidden border-t border-white/5 px-6 py-28 md:py-36">
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-175 -translate-x-1/2 rounded-full bg-cyan-500/6 blur-[130px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/60">
                  Bienvenido a GameZone
                </p>
              </div>

              <div>
                <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                  Tu siguiente aventura comienza con una
                  <span className="bg-linear-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                    {" "}
                    nueva historia.
                  </span>
                </h2>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-white/45">
                  GameZone reúne diferentes experiencias del mundo de los
                  videojuegos en una plataforma moderna, visual y diseñada
                  para disfrutar cada universo de una forma diferente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            OBJETIVOS
        ========================= */}

        <section className="mx-auto max-w-7xl px-6 pb-32">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-violet-300/60">
                Nuestra misión
              </p>

              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                Objetivos de GameZone
              </h2>
            </div>

            <p className="max-w-lg text-sm leading-6 text-white/40">
              Creamos una experiencia sencilla y visual para acercarte a
              distintos universos, estilos e historias del gaming.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {objetivos.map((objetivo) => (
              <article
                key={objetivo.number}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-cyan-400/20 hover:bg-white/5"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/4 blur-3xl transition duration-500 group-hover:bg-violet-500/8" />

                <span className="text-xs font-semibold tracking-[0.25em] text-white/25">
                  {objetivo.number}
                </span>

                <h3 className="mt-20 text-2xl font-semibold">
                  {objetivo.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/45">
                  {objetivo.description}
                </p>

                <div className="mt-8 h-px bg-linear-to-r from-cyan-400/30 to-transparent" />
              </article>
            ))}
          </div>
        </section>

        <section className="relative border-y border-white/5 bg-white/1.5 px-6 py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/60">
                Una experiencia diferente
              </p>

              <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Video, imagen y diseño en una sola experiencia.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/45">
                Nuestro carrusel combina videos e imágenes para presentar cada
                videojuego de una forma más dinámica, atractiva e inmersiva.
              </p>

              <a
                href="#games"
                className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/12"
              >
                Explorar contenido

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>


            <aside className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] p-8 backdrop-blur-xl md:p-10">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative grid grid-cols-2 gap-4">
                <article className="rounded-2xl border border-white/6 bg-black/20 p-6">
                  <strong className="text-3xl font-semibold">10</strong>
                  <p className="mt-2 text-sm text-white/40">Slides</p>
                </article>

                <article className="rounded-2xl border border-white/6lack/20 p-6">
                  <strong className="text-3xl font-semibold">5</strong>
                  <p className="mt-2 text-sm text-white/40">
                    Videojuegos
                  </p>
                </article>

                <article className="rounded-2xl border border-white/6 bg-black/20 p-6">
                  <strong className="text-3xl font-semibold">5</strong>
                  <p className="mt-2 text-sm text-white/40">Videos</p>
                </article>

                <article className="rounded-2xl border border-white/6 bg-black/20 p-6">
                  <strong className="bg-linear-to-r from-cyan-300 to-violet-400 bg-clip-text text-3xl font-semibold text-transparent">
                    100%
                  </strong>

                  <p className="mt-2 text-sm text-white/40">
                    Responsive
                  </p>
                </article>
              </div>
            </aside>
          </div>
        </section>


        <section className="relative overflow-hidden px-6 py-28">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/8 blur-[120px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/30">
              GameZone
            </p>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              ¿Listo para entrar al juego?
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/45">
              Explora nuestra plataforma y descubre cada experiencia preparada
              para ti.
            </p>

            <a
              href="/login"
              className="group relative mt-9 inline-flex items-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/12"
            >
              Comenzar

              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}