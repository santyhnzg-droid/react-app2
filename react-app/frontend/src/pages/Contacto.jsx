import { useState } from "react";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer/Footer";
import { Input } from "../components/forms/Input";
import { Button } from "../components/forms/Button";

export function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const handleChange = ({ target }) => {
    setForm((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="min-h-screen bg-[#030509] text-white">
      <header className="relative border-b border-white/5 bg-[#05070b]">
        <Navbar />

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-40 md:pb-32">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/60">
            Contacto
          </p>

          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
            Hablemos de ti
            <span className="bg-linear-to-rrom-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {" "}próxima aventura.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-white/45">
            ¿Tienes una pregunta, sugerencia o simplemente quieres escribirnos?
            Estamos listos para escucharte.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <aside>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300/60">
            GameZone Support
          </p>

          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Estamos aquí para ayudarte.
          </h2>

          <p className="mt-5 max-w-md text-base leading-7 text-white/40">
            Escríbenos y cuéntanos en qué podemos ayudarte. Nuestro objetivo es
            ofrecer una experiencia clara y cercana dentro de la plataforma.
          </p>

          <div className="mt-10 space-y-4">
            <article className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                Respuesta
              </p>
              <p className="mt-2 text-sm text-white/70">
                Atención rápida y clara
              </p>
            </article>

            <article className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                Disponibilidad
              </p>
              <p className="mt-2 text-sm text-white/70">
                Canal de contacto disponible para consultas
              </p>
            </article>
          </div>
        </aside>

        <section
          aria-labelledby="contact-form-title"
          className="rounded-3xl border border-white/8 bg-white/[0.035] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10"
        >
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300/60">
              Formulario
            </p>

            <h2
              id="contact-form-title"
              className="mt-3 text-3xl font-semibold"
            >
              Envíanos un mensaje
            </h2>

            <p className="mt-2 text-sm text-white/35">
              Completa los campos y envíanos tu consulta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              maxLength={50}
              required
            />

            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              maxLength={100}
              required
            />

            <div>
              <label
                htmlFor="mensaje"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/60"
              >
                Mensaje <span className="text-cyan-300">*</span>
              </label>

              <textarea
                id="mensaje"
                name="mensaje"
                rows="6"
                value={form.mensaje}
                onChange={handleChange}
                maxLength={500}
                placeholder="Escribe tu mensaje..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/4 px-4 py-3.5 text-white outline-none backdrop-blur-xl transition placeholder:text-white/25 focus:border-cyan-300/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-cyan-400/[0.07]"
              />

              <p className="mt-1 text-right text-xs text-white/25">
                {form.mensaje.length}/500
              </p>
            </div>

            <Button type="submit">
              Enviar mensaje
            </Button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}