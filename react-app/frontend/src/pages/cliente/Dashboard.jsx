import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  Navbar,
} from "../../components/Navbar/Navbar";


export function ClienteDashboard() {
  const {
    usuario,
  } = useAuth();


  return (
    <main
      className="
        min-h-screen
        overflow-hidden
        bg-[#030509]
        text-white
      "
    >

      <Navbar />


      {/* DECORACIÓN */}
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
            -left-40
            top-20
            h-125
            w-125
            rounded-full
            bg-cyan-500/8
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            -right-40
            bottom-0
            h-125
            w-125
            rounded-full
            bg-violet-600/8
            blur-[150px]
          "
        />
      </div>


      <div
        className="
          relative
          z-10
          mx-auto
          max-w-375
          px-5
          pb-20
          pt-36
          sm:px-8
          lg:px-12
        "
      >

        {/* HERO */}
        <section
          className="
            relative
            overflow-hidden
            rounded-[34px]
            border
            border-white/10
            bg-linear-to-br
            from-white/7.5
            to-white/2
            p-7
            shadow-[0_30px_90px_rgba(0,0,0,.35)]
            backdrop-blur-xl
            md:p-10
          "
        >

          <div
            className="
              absolute
              -right-20
              -top-20
              h-80
              w-80
              rounded-full
              bg-cyan-400/10
              blur-[100px]
            "
          />


          <div
            className="
              relative
              z-10
              grid
              gap-8
              lg:grid-cols-[1fr_auto]
              lg:items-end
            "
          >

            <div>
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
                    bg-emerald-300
                    shadow-[0_0_14px_rgba(110,231,183,.8)]
                  "
                />

                Cuenta activa
              </div>


              <p
                className="
                  mt-7
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-white/30
                "
              >
                Mi GameZone
              </p>


              <h1
                className="
                  mt-3
                  max-w-4xl
                  text-4xl
                  font-black
                  tracking-tight
                  md:text-6xl
                "
              >
                Bienvenido,{" "}
                <span
                  className="
                    bg-linear-to-r
                    from-cyan-300
                    via-blue-300
                    to-violet-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  {usuario?.nombre}
                </span>
              </h1>


              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-white/40
                  md:text-base
                "
              >
                Desde aquí puedes consultar
                los datos de tu cuenta,
                regresar a la tienda y
                explorar todos los juegos
                disponibles en GameZone.
              </p>

            </div>


            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >
              <Link
                to="/"
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white/70
                  transition

                  hover:-translate-y-0.5
                  hover:bg-white/10
                  hover:text-white
                "
              >
                ← Ir al inicio
              </Link>

              <Link
                to="/productos"
                className="
                  rounded-xl
                  bg-linear-to-r
                  from-cyan-400
                  to-cyan-300
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-[#031015]
                  shadow-lg
                  transition

                  hover:-translate-y-0.5
                  hover:shadow-cyan-400/20
                "
              >
                Ver juegos →
              </Link>
            </div>

          </div>

        </section>


        {/* CUERPO */}
        <section
          className="
            mt-7
            grid
            gap-6
            lg:grid-cols-[1.15fr_.85fr]
          "
        >

          {/* ACCIONES */}
          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >

            <Link
              to="/productos"
              className="
                group
                relative
                min-h-64
                overflow-hidden
                rounded-[28px]
                border
                border-white/8
                bg-white/[0.035]
                p-7
                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-cyan-300/25
                hover:bg-white/5.5
              "
            >

              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  h-52
                  w-52
                  rounded-full
                  bg-cyan-400/8
                  blur-[70px]
                  transition
                  group-hover:bg-cyan-400/15
                "
              />

              <div className="relative z-10">

                <span
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-cyan-300/15
                    bg-cyan-400/10
                    text-xl
                  "
                >
                  🎮
                </span>


                <p
                  className="
                    mt-8
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-cyan-300/50
                  "
                >
                  Catálogo
                </p>


                <h2
                  className="
                    mt-3
                    text-2xl
                    font-black
                  "
                >
                  Explorar juegos
                </h2>


                <p
                  className="
                    mt-3
                    max-w-xs
                    text-sm
                    leading-6
                    text-white/35
                  "
                >
                  Descubre los videojuegos
                  disponibles y encuentra tu
                  próxima aventura.
                </p>


                <span
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-cyan-300
                  "
                >
                  Ir al catálogo

                  <span
                    className="
                      transition
                      group-hover:translate-x-1
                    "
                  >
                    →
                  </span>
                </span>

              </div>

            </Link>


            <Link
              to="/contacto"
              className="
                group
                relative
                min-h-64
                overflow-hidden
                rounded-[28px]
                border
                border-white/8
                bg-white/[0.035]
                p-7
                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-violet-300/25
                hover:bg-white/5.5
              "
            >

              <div
                className="
                  absolute
                  -right-16
                  -top-16
                  h-52
                  w-52
                  rounded-full
                  bg-violet-400/8
                  blur-[70px]
                  transition
                  group-hover:bg-violet-400/15
                "
              />

              <div className="relative z-10">

                <span
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-violet-300/15
                    bg-violet-400/10
                    text-xl
                  "
                >
                  ✦
                </span>


                <p
                  className="
                    mt-8
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-violet-300/50
                  "
                >
                  Soporte
                </p>


                <h2
                  className="
                    mt-3
                    text-2xl
                    font-black
                  "
                >
                  ¿Necesitas ayuda?
                </h2>


                <p
                  className="
                    mt-3
                    max-w-xs
                    text-sm
                    leading-6
                    text-white/35
                  "
                >
                  Comunícate con GameZone si
                  tienes alguna pregunta sobre
                  nuestros productos.
                </p>


                <span
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-violet-300
                  "
                >
                  Contactar

                  <span
                    className="
                      transition
                      group-hover:translate-x-1
                    "
                  >
                    →
                  </span>
                </span>

              </div>

            </Link>

          </div>


          {/* PERFIL */}
          <article
            className="
              rounded-[28px]
              border
              border-white/10
              bg-white/4
              p-7
              shadow-2xl
              backdrop-blur-xl
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
                border-b
                border-white/8
                pb-6
              "
            >

              <span
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-linear-to-br
                  from-cyan-400
                  to-violet-500
                  text-xl
                  font-black
                  text-black
                  shadow-lg
                "
              >
                {usuario?.nombre
                  ?.charAt(0)
                  .toUpperCase()}
              </span>


              <div className="min-w-0">

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-white/30
                  "
                >
                  Mi perfil
                </p>

                <h2
                  className="
                    mt-1
                    truncate
                    text-xl
                    font-black
                  "
                >
                  {usuario?.nombre}{" "}
                  {usuario?.apellido}
                </h2>

              </div>

            </div>


            <dl
              className="
                mt-6
                space-y-5
              "
            >

              <div
                className="
                  rounded-xl
                  border
                  border-white/6
                  bg-black/10
                  px-4
                  py-3
                "
              >
                <dt
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-white/25
                  "
                >
                  Nombre completo
                </dt>

                <dd
                  className="
                    mt-2
                    text-sm
                    font-semibold
                    text-white/80
                  "
                >
                  {usuario?.nombre}{" "}
                  {usuario?.apellido}
                </dd>
              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-white/6
                  bg-black/10
                  px-4
                  py-3
                "
              >
                <dt
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-white/25
                  "
                >
                  Correo electrónico
                </dt>

                <dd
                  className="
                    mt-2
                    break-all
                    text-sm
                    font-semibold
                    text-white/80
                  "
                >
                  {usuario?.email}
                </dd>
              </div>


              {usuario?.telefono && (
                <div
                  className="
                    rounded-xl
                    border
                    border-white/6
                    bg-black/10
                    px-4
                    py-3
                  "
                >
                  <dt
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-white/25
                    "
                  >
                    Teléfono
                  </dt>

                  <dd
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-white/80
                    "
                  >
                    {usuario.telefono}
                  </dd>
                </div>
              )}


              <div
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-cyan-300/10
                  bg-cyan-400/4
                  px-4
                  py-3
                "
              >

                <div>
                  <dt
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-cyan-300/40
                    "
                  >
                    Rol
                  </dt>

                  <dd
                    className="
                      mt-2
                      text-sm
                      font-bold
                      text-cyan-300
                    "
                  >
                    {usuario?.rol}
                  </dd>
                </div>


                <span
                  className="
                    rounded-full
                    border
                    border-emerald-300/15
                    bg-emerald-400/8
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-emerald-300
                  "
                >
                  Activo
                </span>

              </div>

            </dl>

          </article>

        </section>


        {/* INFO INFERIOR */}
        <section
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-3
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-white/8
              bg-white/2.5
              p-5
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-[0.17em]
                text-white/25
              "
            >
              Sesión
            </p>

            <p
              className="
                mt-3
                font-bold
                text-emerald-300
              "
            >
              Protegida con JWT
            </p>
          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/8
              bg-white/2.5
              p-5
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-[0.17em]
                text-white/25
              "
            >
              Tipo de cuenta
            </p>

            <p
              className="
                mt-3
                font-bold
                text-cyan-300
              "
            >
              Cliente GameZone
            </p>
          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/8
              bg-white/2.5
              p-5
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-[0.17em]
                text-white/25
              "
            >
              Acceso
            </p>

            <p
              className="
                mt-3
                font-bold
                text-violet-300
              "
            >
              Catálogo y soporte
            </p>
          </div>

        </section>

      </div>

    </main>
  );
}


export default ClienteDashboard;