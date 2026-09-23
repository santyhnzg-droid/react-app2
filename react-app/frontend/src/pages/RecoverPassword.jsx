import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  restablecerPassword,
  solicitarRecuperacionPassword,
} from "../services/api";

import {
  Navbar,
} from "../components/Navbar/Navbar";


export function RecoverPassword() {
  const navigate = useNavigate();

  const [
    step,
    setStep,
  ] = useState("email");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    token,
    setToken,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    countdown,
    setCountdown,
  ] = useState(3);


  /* ========================================
     VALIDACIONES DE CONTRASEÑA
  ======================================== */

  const passwordRules =
    useMemo(
      () => ({
        length:
          password.length >= 8,

        uppercase:
          /[A-Z]/.test(
            password
          ),

        lowercase:
          /[a-z]/.test(
            password
          ),

        number:
          /\d/.test(
            password
          ),
      }),
      [password]
    );


  const passwordValid =
    useMemo(
      () =>
        Object.values(
          passwordRules
        ).every(Boolean),
      [passwordRules]
    );


  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password ===
      confirmPassword;


  /* ========================================
     REDIRECCIÓN DESPUÉS DEL CAMBIO
  ======================================== */

  useEffect(() => {
    const recoveryToken = new URLSearchParams(window.location.search).get("token");
    if (recoveryToken) {
      setToken(recoveryToken);
      setStep("password");
    }
  }, []);

  useEffect(() => {
    if (
      step !== "success"
    ) {
      return;
    }

    setCountdown(3);

    const interval =
      setInterval(() => {
        setCountdown(
          (current) => {
            if (
              current <= 1
            ) {
              clearInterval(
                interval
              );

              return 0;
            }

            return (
              current - 1
            );
          }
        );
      }, 1000);


    const timeout =
      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }, 3000);


    return () => {
      clearInterval(
        interval
      );

      clearTimeout(
        timeout
      );
    };
  }, [
    step,
    navigate,
  ]);


  /* ========================================
     SOLICITAR TOKEN
  ======================================== */

  async function handleRequest(
    event
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (!cleanEmail) {
      setError(
        "Ingresa tu correo electrónico."
      );

      return;
    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {
      setError(
        "Ingresa un correo electrónico válido."
      );

      return;
    }


    setLoading(true);


    try {
      const result =
        await solicitarRecuperacionPassword(
          cleanEmail
        );


      setMessage(
        result.message ||
          "Solicitud procesada correctamente."
      );


      /*
       * En desarrollo FastAPI devuelve
       * reset_token.
       *
       * Lo colocamos automáticamente
       * para facilitar las pruebas.
       */
      if (
        result.reset_token
      ) {
        setToken(
          result.reset_token
        );
      }


      setStep(
        "password"
      );

    } catch (err) {
      setError(
        err.message ||
          "No fue posible procesar la solicitud."
      );

    } finally {
      setLoading(false);
    }
  }


  /* ========================================
     CAMBIAR CONTRASEÑA
  ======================================== */

  async function handleReset(
    event
  ) {
    event.preventDefault();

    setError("");
    setMessage("");


    if (!token.trim()) {
      setError(
        "Ingresa el token de recuperación."
      );

      return;
    }


    if (
      !passwordValid
    ) {
      setError(
        "La nueva contraseña todavía no cumple todos los requisitos."
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
        result.message ||
          "Contraseña actualizada correctamente."
      );


      setStep(
        "success"
      );

    } catch (err) {
      setError(
        err.message ||
          "No fue posible actualizar la contraseña."
      );

    } finally {
      setLoading(false);
    }
  }


  /* ========================================
     VOLVER AL PASO DEL CORREO
  ======================================== */

  function restartProcess() {
    setStep(
      "email"
    );

    setToken("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  }


  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#030509]
        text-white
      "
    >

      <Navbar />


      {/* =====================================
          FONDO
      ===================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            -left-48
            top-20
            h-130
            w-130
            rounded-full
            bg-cyan-500/10
            blur-[160px]
          "
        />

        <div
          className="
            absolute
            -right-52
            bottom-0
            h-140
            w-140
            rounded-full
            bg-violet-600/10
            blur-[170px]
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-87.5
            w-87.5
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-blue-500/5
            blur-[130px]
          "
        />

      </div>


      {/* =====================================
          CONTENIDO
      ===================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-375
          items-center
          justify-center
          px-5
          pb-16
          pt-36
          sm:px-8
        "
      >

        <div
          className="
            grid
            w-full
            max-w-6xl
            overflow-hidden
            rounded-[36px]
            border
            border-white/10
            bg-white/[0.035]
            shadow-[0_40px_120px_rgba(0,0,0,.55)]
            backdrop-blur-2xl
            lg:grid-cols-[.9fr_1.1fr]
          "
        >

          {/* =================================
              PANEL IZQUIERDO
          ================================= */}

          <section
            className="
              relative
              hidden
              overflow-hidden
              border-r
              border-white/8
              bg-linear-to-br
              from-cyan-500/9
              via-transparent
              to-violet-500/8
              p-12
              lg:flex
              lg:flex-col
              lg:justify-between
            "
          >

            <div
              className="
                absolute
                -left-20
                -top-20
                h-72
                w-72
                rounded-full
                bg-cyan-400/10
                blur-[90px]
              "
            />


            <div
              className="
                relative
                z-10
              "
            >

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-300/15
                  bg-cyan-400/8
                  px-4
                  py-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-300
                "
              >

                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_14px_rgba(103,232,249,.8)]
                  "
                />

                Seguridad GameZone

              </div>


              <h1
                className="
                  mt-8
                  max-w-md
                  text-4xl
                  font-black
                  leading-tight
                  tracking-tight
                "
              >
                Recupera el acceso a tu{" "}

                <span
                  className="
                    bg-linear-to-r
                    from-cyan-300
                    to-violet-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  cuenta.
                </span>
              </h1>


              <p
                className="
                  mt-5
                  max-w-md
                  text-sm
                  leading-7
                  text-white/40
                "
              >
                Confirma tu correo,
                utiliza el token temporal
                y crea una contraseña
                nueva para volver a
                disfrutar GameZone.
              </p>

            </div>


            <div
              className="
                relative
                z-10
                space-y-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/8
                  bg-black/10
                  p-4
                "
              >

                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-400/10
                    text-cyan-300
                  "
                >
                  1
                </span>

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Verifica tu correo
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/30
                    "
                  >
                    Solicitaremos un
                    token temporal.
                  </p>
                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/8
                  bg-black/10
                  p-4
                "
              >

                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-400/10
                    text-violet-300
                  "
                >
                  2
                </span>

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Cambia tu contraseña
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/30
                    "
                  >
                    Crea una contraseña
                    segura y diferente.
                  </p>
                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-white/8
                  bg-black/10
                  p-4
                "
              >

                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-400/10
                    text-emerald-300
                  "
                >
                  ✓
                </span>

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Vuelve a iniciar sesión
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/30
                    "
                  >
                    Entrarás usando tu
                    nueva contraseña.
                  </p>
                </div>

              </div>

            </div>

          </section>


          {/* =================================
              FORMULARIO
          ================================= */}

          <section
            className="
              p-6
              sm:p-10
              lg:p-12
            "
          >

            {/* PASO CORREO */}
            {step ===
              "email" && (
              <div>

                <div
                  className="
                    mb-8
                  "
                >

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.22em]
                      text-cyan-300/60
                    "
                  >
                    Paso 1 de 2
                  </p>

                  <h2
                    className="
                      mt-3
                      text-3xl
                      font-black
                      tracking-tight
                    "
                  >
                    Recuperar contraseña
                  </h2>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-white/40
                    "
                  >
                    Ingresa el correo
                    asociado a tu cuenta
                    GameZone.
                  </p>

                </div>


                {error && (
                  <ErrorAlert
                    message={error}
                  />
                )}


                <form
                  onSubmit={
                    handleRequest
                  }
                  className="
                    mt-6
                    space-y-6
                  "
                >

                  <div>

                    <label
                      htmlFor="recover-email"
                      className="
                        mb-2
                        block
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.13em]
                        text-white/45
                      "
                    >
                      Correo electrónico
                    </label>


                    <div
                      className="
                        group
                        relative
                      "
                    >

                      <span
                        className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-white/25
                          transition
                          group-focus-within:text-cyan-300
                        "
                      >
                        @
                      </span>


                      <input
                        id="recover-email"
                        type="email"
                        value={email}
                        onChange={(
                          event
                        ) =>
                          setEmail(
                            event
                              .target
                              .value
                          )
                        }
                        autoComplete="email"
                        placeholder="correo@ejemplo.com"
                        required
                        className="
                          w-full
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/20
                          py-4
                          pl-11
                          pr-4
                          text-sm
                          text-white
                          outline-none
                          transition

                          placeholder:text-white/20

                          hover:border-white/20

                          focus:border-cyan-300/40
                          focus:bg-cyan-400/2.5
                          focus:ring-4
                          focus:ring-cyan-400/5
                        "
                      />

                    </div>

                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      bg-linear-to-r
                      from-cyan-400
                      to-cyan-300
                      px-5
                      py-4
                      text-sm
                      font-black
                      uppercase
                      tracking-[0.08em]
                      text-[#041014]
                      shadow-xl
                      transition-all

                      hover:-translate-y-0.5
                      hover:shadow-cyan-400/20

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      disabled:hover:translate-y-0
                    "
                  >

                    {loading ? (
                      <>
                        <Spinner />

                        Procesando...
                      </>
                    ) : (
                      <>
                        Continuar

                        <span
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        >
                          →
                        </span>
                      </>
                    )}

                  </button>

                </form>


                <LoginLink />

              </div>
            )}


            {/* PASO CONTRASEÑA */}
            {step ===
              "password" && (
              <div>

                <div
                  className="
                    mb-7
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.22em]
                        text-violet-300/60
                      "
                    >
                      Paso 2 de 2
                    </p>


                    <button
                      type="button"
                      onClick={
                        restartProcess
                      }
                      className="
                        text-xs
                        font-semibold
                        text-white/35
                        transition
                        hover:text-white
                      "
                    >
                      Cambiar correo
                    </button>

                  </div>


                  <h2
                    className="
                      mt-3
                      text-3xl
                      font-black
                      tracking-tight
                    "
                  >
                    Nueva contraseña
                  </h2>


                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-white/40
                    "
                  >
                    Establece una nueva
                    contraseña para{" "}

                    <span
                      className="
                        font-semibold
                        text-white/70
                      "
                    >
                      {email}
                    </span>
                  </p>

                </div>


                {message && (
                  <SuccessAlert
                    message={
                      message
                    }
                  />
                )}


                {error && (
                  <ErrorAlert
                    message={error}
                  />
                )}


                <form
                  onSubmit={
                    handleReset
                  }
                  className="
                    mt-6
                    space-y-5
                  "
                >

                  {/* TOKEN */}
                  <div>

                    <label
                      htmlFor="reset-token"
                      className="
                        mb-2
                        block
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.13em]
                        text-white/45
                      "
                    >
                      Token de recuperación
                    </label>


                    <input
                      id="reset-token"
                      type="text"
                      value={token}
                      onChange={(
                        event
                      ) =>
                        setToken(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Pega aquí tu token"
                      required
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-white/10
                        bg-black/20
                        px-4
                        py-4
                        font-mono
                        text-xs
                        text-white
                        outline-none
                        transition

                        placeholder:font-sans
                        placeholder:text-white/20

                        focus:border-violet-300/40
                        focus:ring-4
                        focus:ring-violet-400/5
                      "
                    />


                    {token && (
                      <p
                        className="
                          mt-2
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-emerald-300/60
                        "
                      >
                        <span>✓</span>

                        Token detectado
                      </p>
                    )}

                  </div>


                  {/* PASSWORD */}
                  <PasswordInput
                    id="new-password"
                    label="Nueva contraseña"
                    value={password}
                    onChange={
                      setPassword
                    }
                    visible={
                      showPassword
                    }
                    onToggle={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                  />


                  {/* REGLAS */}
                  <div
                    className="
                      grid
                      gap-2
                      rounded-2xl
                      border
                      border-white/7
                      bg-black/10
                      p-4
                      sm:grid-cols-2
                    "
                  >

                    <PasswordRule
                      valid={
                        passwordRules.length
                      }
                    >
                      Mínimo 8 caracteres
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.uppercase
                      }
                    >
                      Una mayúscula
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.lowercase
                      }
                    >
                      Una minúscula
                    </PasswordRule>

                    <PasswordRule
                      valid={
                        passwordRules.number
                      }
                    >
                      Un número
                    </PasswordRule>

                  </div>


                  {/* CONFIRMAR */}
                  <PasswordInput
                    id="confirm-password"
                    label="Confirmar contraseña"
                    value={
                      confirmPassword
                    }
                    onChange={
                      setConfirmPassword
                    }
                    visible={
                      showConfirmPassword
                    }
                    onToggle={() =>
                      setShowConfirmPassword(
                        (current) =>
                          !current
                      )
                    }
                  />


                  {confirmPassword && (
                    <p
                      className={`
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-semibold

                        ${
                          passwordsMatch
                            ? "text-emerald-300"
                            : "text-red-300"
                        }
                      `}
                    >
                      <span>
                        {passwordsMatch
                          ? "✓"
                          : "×"}
                      </span>

                      {passwordsMatch
                        ? "Las contraseñas coinciden."
                        : "Las contraseñas no coinciden."}
                    </p>
                  )}


                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !passwordValid ||
                      !passwordsMatch ||
                      !token.trim()
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      bg-linear-to-r
                      from-violet-400
                      via-indigo-400
                      to-cyan-400
                      px-5
                      py-4
                      text-sm
                      font-black
                      uppercase
                      tracking-[0.08em]
                      text-[#05060b]
                      shadow-xl
                      transition-all

                      hover:-translate-y-0.5
                      hover:shadow-violet-400/20

                      disabled:cursor-not-allowed
                      disabled:opacity-35
                      disabled:hover:translate-y-0
                    "
                  >

                    {loading ? (
                      <>
                        <Spinner />

                        Actualizando...
                      </>
                    ) : (
                      <>
                        Actualizar contraseña

                        <span>
                          ✓
                        </span>
                      </>
                    )}

                  </button>

                </form>


                <LoginLink />

              </div>
            )}


            {/* ÉXITO */}
            {step ===
              "success" && (
              <div
                className="
                  flex
                  min-h-125
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >

                <div
                  className="
                    relative
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-[28px]
                    border
                    border-emerald-300/20
                    bg-emerald-400/10
                    text-4xl
                    text-emerald-300
                    shadow-[0_0_60px_rgba(52,211,153,.15)]
                  "
                >

                  <div
                    className="
                      absolute
                      inset-0
                      animate-ping
                      rounded-[28px]
                      border
                      border-emerald-300/10
                    "
                  />

                  <span
                    className="
                      relative
                      z-10
                    "
                  >
                    ✓
                  </span>

                </div>


                <p
                  className="
                    mt-8
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-emerald-300/60
                  "
                >
                  Proceso completado
                </p>


                <h2
                  className="
                    mt-3
                    text-3xl
                    font-black
                    tracking-tight
                    sm:text-4xl
                  "
                >
                  Contraseña actualizada
                </h2>


                <p
                  className="
                    mt-4
                    max-w-md
                    text-sm
                    leading-7
                    text-white/40
                  "
                >
                  Tu contraseña fue
                  modificada correctamente.
                  Ahora puedes iniciar
                  sesión con tus nuevas
                  credenciales.
                </p>


                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-white/8
                    bg-black/15
                    px-6
                    py-4
                  "
                >

                  <p
                    className="
                      text-xs
                      text-white/35
                    "
                  >
                    Redirigiendo al inicio
                    de sesión en
                  </p>


                  <p
                    className="
                      mt-1
                      text-2xl
                      font-black
                      text-cyan-300
                    "
                  >
                    {countdown}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login",
                      {
                        replace: true,
                      }
                    )
                  }
                  className="
                    mt-7
                    rounded-2xl
                    bg-linear-to-r
                    from-cyan-400
                    to-cyan-300
                    px-7
                    py-4
                    text-sm
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-[#041014]
                    shadow-xl
                    transition-all

                    hover:-translate-y-0.5
                    hover:shadow-cyan-400/20
                  "
                >
                  Iniciar sesión ahora →
                </button>

              </div>
            )}

          </section>

        </div>

      </div>

    </main>
  );
}


/* ==========================================
   COMPONENTE PASSWORD
========================================== */

function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-xs
          font-bold
          uppercase
          tracking-[0.13em]
          text-white/45
        "
      >
        {label}
      </label>


      <div
        className="
          relative
        "
      >

        <input
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          autoComplete="new-password"
          required
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-black/20
            px-4
            py-4
            pr-20
            text-sm
            text-white
            outline-none
            transition

            focus:border-cyan-300/40
            focus:ring-4
            focus:ring-cyan-400/5
          "
        />


        <button
          type="button"
          onClick={onToggle}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rounded-lg
            px-3
            py-2
            text-xs
            font-semibold
            text-white/35
            transition
            hover:bg-white/5
            hover:text-white
          "
        >
          {visible
            ? "Ocultar"
            : "Ver"}
        </button>

      </div>

    </div>
  );
}


/* ==========================================
   REGLA DE PASSWORD
========================================== */

function PasswordRule({
  valid,
  children,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-2
        text-xs
        transition

        ${
          valid
            ? "text-emerald-300"
            : "text-white/30"
        }
      `}
    >

      <span
        className={`
          flex
          h-5
          w-5
          items-center
          justify-center
          rounded-full
          text-[10px]

          ${
            valid
              ? `
                bg-emerald-400/15
                text-emerald-300
              `
              : `
                bg-white/5
                text-white/25
              `
          }
        `}
      >
        {valid
          ? "✓"
          : "•"}
      </span>

      {children}

    </div>
  );
}


/* ==========================================
   ALERTA ERROR
========================================== */

function ErrorAlert({
  message,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-red-400/20
        bg-red-400/8
        p-4
        text-sm
        text-red-200
      "
    >

      <span
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-red-400/10
          font-black
        "
      >
        !
      </span>

      <p
        className="
          pt-1
          leading-5
        "
      >
        {message}
      </p>

    </div>
  );
}


/* ==========================================
   ALERTA ÉXITO
========================================== */

function SuccessAlert({
  message,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-2xl
        border
        border-emerald-400/20
        bg-emerald-400/[0.07]
        p-4
        text-sm
        text-emerald-200
      "
    >

      <span
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-emerald-400/10
          font-black
        "
      >
        ✓
      </span>

      <p
        className="
          pt-1
          leading-5
        "
      >
        {message}
      </p>

    </div>
  );
}


/* ==========================================
   LOADING
========================================== */

function Spinner() {
  return (
    <span
      className="
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-black/20
        border-t-black
      "
    />
  );
}


/* ==========================================
   VOLVER A LOGIN
========================================== */

function LoginLink() {
  return (
    <div
      className="
        mt-7
        border-t
        border-white/8
        pt-6
        text-center
      "
    >

      <p
        className="
          text-xs
          text-white/30
        "
      >
        ¿Ya recuerdas tu contraseña?
      </p>


      <Link
        to="/login"
        className="
          mt-2
          inline-flex
          items-center
          gap-2
          text-sm
          font-bold
          text-cyan-300
          transition
          hover:text-cyan-200
        "
      >
        ← Volver a iniciar sesión
      </Link>

    </div>
  );
}


export default RecoverPassword;
