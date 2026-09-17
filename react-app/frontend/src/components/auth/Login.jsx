import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Input } from "../forms/Input";
import { Button } from "../forms/Button";
import { RegisterModal } from "./RegisterModal";

import { loginUsuario } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/images/logo.png";

export function Login() {
  const navigate = useNavigate();

  const {
    iniciarSesion,
  } = useAuth();

  const [showRegister, setShowRegister] =
    useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================
     VALIDACIONES
  ========================= */

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "El correo electrónico es obligatorio.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (email.length > 120) {
      return "El correo no puede superar 120 caracteres.";
    }

    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "La contraseña es obligatoria.";
    }

    if (password.length < 6) {
      return "La contraseña debe tener mínimo 6 caracteres.";
    }

    if (password.length > 50) {
      return "La contraseña no puede superar 50 caracteres.";
    }

    return "";
  };

  /* =========================
     CHANGE
  ========================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setServerError("");

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email:
          validateEmail(value),
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password:
          validatePassword(value),
      }));
    }
  };

  /* =========================
     SUBMIT LOGIN REAL
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    const newErrors = {
      email:
        validateEmail(form.email),

      password:
        validatePassword(
          form.password
        ),
    };

    setErrors(newErrors);

    const hasErrors =
      Object.values(
        newErrors
      ).some(Boolean);

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);

      const result =
        await loginUsuario({
          email:
            form.email.trim(),

          password:
            form.password,
        });

      iniciarSesion(result);

      /* =========================
         REDIRECCIÓN POR ROL
      ========================= */

      if (
        result.usuario.rol ===
        "Administrador"
      ) {
        navigate(
          "/admin/productos"
        );

        return;
      }

      if (
        result.usuario.rol ===
        "Empleado"
      ) {
        navigate(
          "/empleado"
        );

        return;
      }

      navigate(
        "/cliente"
      );
    } catch (error) {
      console.error(
        "Error login:",
        error
      );

      setServerError(
        error.message ||
          "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030509] px-5 py-16 text-white">

        {/* =========================
            GLOWS DE FONDO
        ========================= */}

        <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-600/12 blur-[130px]" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/4 blur-[140px]" />

        {/* =========================
            VOLVER
        ========================= */}

        <Link
          to="/"
          className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-xs font-medium text-white/60 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/8 hover:text-white"
        >
          ← Volver
        </Link>

        {/* =========================
            CONTENEDOR
        ========================= */}

        <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/8 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* =========================
              PANEL IZQUIERDO
          ========================= */}

          <aside className="relative hidden overflow-hidden border-r border-white/6 bg-white/2 p-10 lg:flex lg:flex-col lg:justify-between">

            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />

            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[90px]" />

            <div className="relative z-10">
              <img
                src={logo}
                alt="GameZone"
                className="h-20 w-auto"
              />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/60">
                GAMEZONE ACCESS
              </p>

              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
                Vuelve al juego.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/40">
                Ingresa a tu cuenta para continuar
                explorando mundos, historias y
                experiencias dentro de GameZone.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 text-xs text-white/25">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />

              Plataforma activa
            </div>
          </aside>

          {/* =========================
              FORMULARIO
          ========================= */}

          <section className="p-7 sm:p-10 lg:p-12">

            {/* LOGO MOBILE */}

            <img
              src={logo}
              alt="GameZone"
              className="mb-8 h-16 w-auto lg:hidden"
            />

            <header className="mb-9">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/60">
                Bienvenido de nuevo
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Iniciar sesión
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/35">
                Ingresa tus datos para acceder a
                tu cuenta.
              </p>
            </header>

            {/* =========================
                ERROR BACKEND
            ========================= */}

            {serverError && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/6 px-4 py-3 text-sm text-red-300">
                {serverError}
              </div>
            )}

            {/* =========================
                FORM
            ========================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <Input
                label="Correo electrónico"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                error={errors.email}
                maxLength={120}
                autoComplete="email"
                required
              />

              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                error={errors.password}
                maxLength={50}
                autoComplete="current-password"
                required
              />

              {/* =========================
                  RECORDAR + RECUPERAR
              ========================= */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <label className="flex cursor-pointer items-center gap-3 text-sm text-white/50">

                  <input
                    type="checkbox"
                    name="remember"
                    checked={
                      form.remember
                    }
                    onChange={
                      handleChange
                    }
                    className="h-4 w-4 accent-cyan-400"
                  />

                  Recordarme
                </label>

                <Link
                  to="/recover-password"
                  className="text-sm font-medium text-cyan-300/70 transition hover:text-cyan-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* =========================
                  BOTÓN
              ========================= */}

              <div className="pt-2">

                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Ingresando..."
                    : "Iniciar sesión"}
                </Button>

              </div>
            </form>

            {/* =========================
                REGISTRO
            ========================= */}

            <div className="mt-8 border-t border-white/6 pt-7 text-center">

              <p className="text-sm text-white/35">
                ¿Todavía no tienes una cuenta?
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowRegister(
                    true
                  )
                }
                className="mt-3 text-sm font-semibold text-white/80 transition hover:text-cyan-300"
              >
                Crear una cuenta →
              </button>

            </div>

          </section>
        </section>
      </main>

      {/* =========================
          REGISTRO MODAL
      ========================= */}

      <RegisterModal
        isOpen={showRegister}
        onClose={() =>
          setShowRegister(false)
        }
      />
    </>
  );
}