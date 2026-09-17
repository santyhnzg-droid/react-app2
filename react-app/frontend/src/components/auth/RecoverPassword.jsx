import { useMemo, useState } from "react";

import {
  restablecerPassword,
  solicitarRecuperacionPassword,
} from "../../services/api";


export function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  const passwordValid = useMemo(() => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  }, [password]);


  async function handleRequest(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError(
        "Ingresa tu correo electrónico."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await solicitarRecuperacionPassword(
          email.trim()
        );

      setMessage(
        result.message
      );

      if (result.reset_token) {
        setToken(
          result.reset_token
        );
      }

      setStep("reset");
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleReset(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!token.trim()) {
      setError(
        "Ingresa el token de recuperación."
      );
      return;
    }

    if (!passwordValid) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres, "
        + "una mayúscula, una minúscula y un número."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await restablecerPassword(
          token.trim(),
          password
        );

      setMessage(
        result.message
      );

      setStep("done");
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
      <h1 className="text-2xl font-bold">
        Recuperar contraseña
      </h1>

      <p className="mt-2 text-sm text-zinc-400">
        Restablece el acceso a tu cuenta GameZone.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {step === "request" && (
        <form
          onSubmit={handleRequest}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="recover-email"
              className="mb-2 block text-sm font-medium"
            >
              Correo electrónico
            </label>

            <input
              id="recover-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-50"
          >
            {loading
              ? "Generando..."
              : "Recuperar contraseña"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form
          onSubmit={handleReset}
          className="mt-6 space-y-4"
        >
          <div>
            <label
              htmlFor="recover-token"
              className="mb-2 block text-sm font-medium"
            >
              Token temporal
            </label>

            <input
              id="recover-token"
              type="text"
              value={token}
              onChange={(event) =>
                setToken(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Token de recuperación"
              required
            />

            <p className="mt-1 text-xs text-zinc-500">
              En modo desarrollo, FastAPI también
              muestra este token en la terminal.
            </p>
          </div>

          <div>
            <label
              htmlFor="recover-password"
              className="mb-2 block text-sm font-medium"
            >
              Nueva contraseña
            </label>

            <input
              id="recover-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Nueva contraseña"
              required
            />

            <p className="mt-1 text-xs text-zinc-500">
              Mínimo 8 caracteres, una mayúscula,
              una minúscula y un número.
            </p>
          </div>

          <div>
            <label
              htmlFor="recover-confirm-password"
              className="mb-2 block text-sm font-medium"
            >
              Confirmar contraseña
            </label>

            <input
              id="recover-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Repite la nueva contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-bold text-black disabled:opacity-50"
          >
            {loading
              ? "Actualizando..."
              : "Guardar nueva contraseña"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="mt-6">
          <p className="text-sm text-zinc-300">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
      )}
    </div>
  );
}


export default RecoverPassword;