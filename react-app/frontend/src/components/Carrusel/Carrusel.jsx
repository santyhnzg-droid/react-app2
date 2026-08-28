import { useEffect, useRef, useState } from "react";                              
import ghostImage from "../../assets/images/ghost.png";
import gowImage from "../../assets/images/Gow.jpg";
import gtaImage from "../../assets/images/gitiey.webp";
import thelastImage from "../../assets/images/thelast.jpg";
import readImage from "../../assets/images/read.jpg";
import ghostVideo from "../../assets/videos/GHOST.mp4";
import gowVideo from "../../assets/videos/gow.mp4";
import gtaVideo from "../../assets/videos/gta.mp4";
import thelastVideo from "../../assets/videos/thelast.mp4";
import readVideo from "../../assets/videos/read.mp4";

const slides = [
  {
    type: "video",
    video: ghostVideo,
    image: ghostImage,
    subtitle: "GHOST OF TSUSHIMA",
    title: "Lucha por tu honor",
    description:
      "Explora una isla marcada por la guerra y conviértete en el guerrero que Tsushima necesita.",
  },

  {
    type: "image",
    image: ghostImage,
    subtitle: "GHOST OF TSUSHIMA",
    title: "Conviértete en el Fantasma",
    description:
      "Recorre impresionantes paisajes, domina la katana y descubre una aventura inolvidable.",
  },

  {
    type: "video",
    video: gowVideo,
    image: gowImage,
    subtitle: "GOD OF WAR",
    title: "Enfrenta tu destino",
    description:
      "Vive una aventura épica marcada por poderosos enemigos, grandes batallas y una historia inolvidable.",
  },

  {
    type: "image",
    image: gowImage,
    subtitle: "GOD OF WAR",
    title: "El viaje continúa",
    description:
      "Explora increíbles escenarios y enfréntate a criaturas legendarias en una aventura llena de acción.",
  },

  {
    type: "video",
    video: gtaVideo,
    image: gtaImage,
    subtitle: "GRAND THEFT AUTO",
    title: "Una ciudad sin límites",
    description:
      "Explora una enorme ciudad llena de posibilidades, acción, vehículos y aventuras.",
  },

  {
    type: "image",
    image: gtaImage,
    subtitle: "GRAND THEFT AUTO",
    title: "Escribe tu propia historia",
    description:
      "Recorre un enorme mundo abierto donde cada calle puede convertirse en una nueva aventura.",
  },

  {
    type: "video",
    video: thelastVideo,
    image: thelastImage,
    subtitle: "THE LAST OF US",
    title: "Sobrevive a un mundo perdido",
    description:
      "Adéntrate en una historia intensa donde sobrevivir exige tomar decisiones difíciles.",
  },

  {
    type: "image",
    image: thelastImage,
    subtitle: "THE LAST OF US",
    title: "Una historia que dejará huella",
    description:
      "Explora un mundo devastado y acompaña a sus protagonistas en un viaje lleno de peligros y emociones.",
  },

  {
    type: "video",
    video: readVideo,
    image: readImage,
    subtitle: "RED DEAD REDEMPTION",
    title: "Explora el salvaje oeste",
    description:
      "Adéntrate en un enorme mundo abierto lleno de peligros, personajes e historias inolvidables.",
  },

  {
    type: "image",
    image: readImage,
    subtitle: "RED DEAD REDEMPTION",
    title: "Cada decisión escribe tu historia",
    description:
      "Explora paisajes increíbles y vive una aventura donde tus decisiones marcarán el camino.",
  },
];

export function Carrusel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoRef = useRef(null);

  const currentSlide = slides[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1,
    );
  };

  useEffect(() => {
    if (currentSlide.type === "video") {
      return;
    }

    const timer = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentIndex, currentSlide.type]);

  useEffect(() => {
    if (currentSlide.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;

      videoRef.current.play().catch(() => {
        console.log("El navegador bloqueó la reproducción automática.");
      });
    }
  }, [currentIndex, currentSlide.type]);

  return (
    <section className="relative h-screen min-h-170 w-full overflow-hidden bg-black">
      {currentSlide.type === "video" ? (
        <video
          key={currentSlide.video}
          ref={videoRef}
          src={currentSlide.video}
          poster={currentSlide.image}
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={nextSlide}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <img
          key={currentSlide.image}
          src={currentSlide.image}
          alt={currentSlide.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      <div className="pointer-events-none absolute left-0 top-1/2 z-1 h-[82%] w-[62%] -translate-y-1/2 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.50)_0%,rgba(0,0,0,0.32)_30%,rgba(0,0,0,0.12)_52%,transparent_76%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-1 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,transparent_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-40 bg-[linear-gradient(0deg,rgba(0,0,0,0.42)_0%,transparent_100%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center px-7 pt-24 sm:px-12 lg:px-20">
        <div
          key={`${currentIndex}-content`}
          className="w-full max-w-160 text-white"
        >
          <div className="mb-6 flex items-center gap-4">
            <span className="h-0.5 w-9 bg-linear-to-r from-cyan-300 to-violet-400" />

            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/90 drop-shadow-lg sm:text-sm">
              {currentSlide.subtitle}
            </p>
          </div>

          <h1 className="max-w-160 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl lg:text-7xl">
            {currentSlide.title}
          </h1>

          <p className="mt-6 max-w-140 text-base font-normal leading-7 text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] md:text-lg">
            {currentSlide.description}
          </p>

          <button
            type="button"
            className="group relative mt-9 inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-white/8 px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_35px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/[0.14] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.20),0_15px_40px_rgba(0,0,0,0.4),0_0_25px_rgba(34,211,238,0.12)] active:translate-y-0 active:scale-[0.98]"
          >
            <span className="pointer-events-none absolute left-[10%] top-0 h-px w-[80%] bg-linear-to-r from-transparent via-cyan-300/80 to-transparent" />

            <span className="relative z-10">Explorar</span>

            <span className="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/15 text-3xl font-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_rgba(0,0,0,0.30)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)] active:scale-95 md:left-8"
      >
        <span className="-translate-y-0.5">‹</span>
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Siguiente slide"
        className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/15 text-3xl font-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_30px_rgba(0,0,0,0.30)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-violet-300/50 hover:bg-white/12 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] active:scale-95 md:right-8"
      >
        <span className="-translate-y-0.5">›</span>
      </button>

      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/8 bg-black/15 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
        {slides.map((slide, index) => (
          <button
            key={`${slide.subtitle}-${index}`}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir al slide ${index + 1}`}
            className={`
              rounded-full
              transition-all
              duration-300

              ${
                currentIndex === index
                  ? `
                    h-2
                    w-9
                    bg-linear-to-r
                    from-cyan-300
                    to-violet-400
                    shadow-[0_0_12px_rgba(34,211,238,0.35)]
                  `
                  : `
                    h-2
                    w-2
                    bg-white/30
                    hover:scale-125
                    hover:bg-white/80
                  `
              }
            `}
          />
        ))}
      </div>

      <div className="absolute bottom-7 right-8 z-20 hidden items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-4 py-3 text-xs font-semibold tracking-[0.2em] text-white backdrop-blur-xl md:flex">
        <span className="text-cyan-200">
          {String(currentIndex + 1).padStart(2, "0")}
        </span>

        <span className="text-white/30">/</span>

        <span className="text-white/45">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      <div className="absolute bottom-7 left-8 z-20 hidden items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white/60 backdrop-blur-xl lg:flex">
        <span
          className={`
            h-2
            w-2
            rounded-full

            ${
              currentSlide.type === "video"
                ? "animate-pulse bg-cyan-300"
                : "bg-violet-300"
            }
          `}
        />

        {currentSlide.type === "video" ? "Video" : "Imagen"}
      </div>
    </section>
  );
}
