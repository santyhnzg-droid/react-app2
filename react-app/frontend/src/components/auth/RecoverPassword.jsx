import { useState } from "react";
import { Link } from "react-router-dom";

import { Input } from "../forms/Input";
import { Button } from "../forms/Button";

import logo from "../../assets/images/logo.png";

export function RecoverPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) {
      return "El correo electrónico es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return "Ingresa un correo electrónico válido.";
    }

    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    setError(validateEmail(value));

    setSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newError = validateEmail(email);

    setError(newError);

    if (newError) {
      return;
    }

    setSuccess(true);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030509] px-5 py-16 text-white">
      <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-white/8 bg-white/[0.035] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
        <img src={logo} alt="GameZone" className="mx-auto h-20 w-auto" />

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/60">
            Recuperación
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Recuperar contraseña
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/35">
            Ingresa el correo asociado a tu cuenta para iniciar el proceso de
            recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            error={error}
            maxLength={100}
            autoComplete="email"
            required
          />

          {success && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/6 px-4 py-3 text-sm leading-6 text-emerald-300">
              El correo es válido. Las instrucciones serían enviadas a{" "}
              <strong>{email}</strong>.
            </div>
          )}

          <Button type="submit">Recuperar contraseña</Button>
        </form>

        <div className="mt-8 border-t border-white/6 pt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-white/45 transition hover:text-cyan-300"
          >
            ← Regresar al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
