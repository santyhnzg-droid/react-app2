import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/images/logo.png";


export function Navbar() {
  const {
    usuario,
    cerrarSesion,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef = useRef(null);


  const handleLogout = () => {
    setMenuOpen(false);

    cerrarSesion();

    navigate("/");
  };


  const getPanelPath = () => {
    if (!usuario) {
      return "/";
    }

    if (
      usuario.rol ===
      "Administrador"
    ) {
      return "/admin";
    }

    if (
      usuario.rol ===
      "Empleado"
    ) {
      return "/empleado";
    }

    return "/cliente";
  };


  const getPanelLabel = () => {
    if (
      usuario?.rol ===
      "Administrador"
    ) {
      return "Panel administrativo";
    }

    if (
      usuario?.rol ===
      "Empleado"
    ) {
      return "Panel de empleado";
    }

    return "Mi cuenta";
  };


  const getPqrPath = () => {
    if (usuario?.rol === "Administrador" || usuario?.rol === "Empleado") {
      return "/admin/pqr";
    }

    return usuario ? "/cliente/pqr" : "/login";
  };


  const isActive = (path) => {
    if (path === "/") {
      return (
        location.pathname === "/"
      );
    }

    return location.pathname.startsWith(
      path
    );
  };


  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);


  const navClass = (path) => {
    const active =
      isActive(path);

    return `
      relative
      rounded-xl
      px-4
      py-3
      text-sm
      font-medium
      transition-all
      duration-300

      ${
        active
          ? `
            bg-white/10
            text-white
          `
          : `
            text-white/60
            hover:bg-white/5
            hover:text-white
          `
      }
    `;
  };


  return (
    <nav className="absolute left-0 top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">

      <div
        className="
          mx-auto
          flex
          max-w-[1600px]
          items-center
          justify-between
          gap-4
        "
      >

        {/* LOGO */}
        <Link
          to="/"
          className="
            group
            flex
            shrink-0
            items-center
            transition
            duration-300
            hover:-translate-y-0.5
          "
        >
          <img
            src={logo}
            alt="GameZone"
            className="
              h-20
              w-auto
              object-contain
              transition
              duration-300
              group-hover:scale-105
              sm:h-24
            "
          />
        </Link>


        {/* MENÚ PRINCIPAL */}
        <ul
          className="
            hidden
            items-center
            gap-1
            rounded-2xl
            border
            border-white/8
            bg-black/15
            p-1
            backdrop-blur-xl
            md:flex
          "
        >

          <li>
            <Link
              to="/"
              className={navClass("/")}
            >
              Inicio
            </Link>
          </li>

          <li>
            <Link
              to="/productos"
              className={navClass(
                "/productos"
              )}
            >
              Productos
            </Link>
          </li>

          <li>
            <Link
              to="/servicios"
              className={navClass("/servicios")}
            >
              Servicios
            </Link>
          </li>

          <li>
            <Link
              to="/quienes-somos"
              className={navClass(
                "/quienes-somos"
              )}
            >
              Quiénes somos
            </Link>
          </li>

          <li>
            <Link
              to="/contacto"
              className={navClass(
                "/contacto"
              )}
            >
              Contacto
            </Link>
          </li>

          <li>
            <Link
              to={getPqrPath()}
              className={navClass("/cliente/pqr")}
            >
              PQR / Soporte
            </Link>
          </li>

        </ul>


        {/* USUARIO */}
        <div
          ref={menuRef}
          className="relative"
        >

          {usuario ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    (current) =>
                      !current
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  px-3
                  py-2.5
                  text-left
                  shadow-2xl
                  backdrop-blur-xl
                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:border-cyan-300/30
                  hover:bg-white/[0.07]
                "
              >

                {/* AVATAR */}
                <span
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-300/20
                    bg-linear-to-br
                    from-cyan-400/20
                    to-violet-500/20
                    text-sm
                    font-black
                    text-cyan-200
                    shadow-lg
                  "
                >
                  {usuario.nombre
                    ?.charAt(0)
                    .toUpperCase()}
                </span>


                {/* INFO */}
                <span
                  className="
                    hidden
                    min-w-0
                    sm:block
                  "
                >
                  <span
                    className="
                      block
                      max-w-32
                      truncate
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {usuario.nombre}
                  </span>

                  <span
                    className="
                      mt-0.5
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-cyan-300/60
                    "
                  >
                    {usuario.rol}
                  </span>
                </span>


                {/* FLECHA */}
                <span
                  className={`
                    ml-1
                    text-xs
                    text-white/40
                    transition-transform
                    duration-300

                    ${
                      menuOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                >
                  ▼
                </span>

              </button>


              {/* SUBMENÚ */}
              {menuOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-72
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#080b12]/95
                    p-2
                    shadow-[0_25px_80px_rgba(0,0,0,.65)]
                    backdrop-blur-2xl
                  "
                >

                  {/* CABECERA */}
                  <div
                    className="
                      border-b
                      border-white/8
                      px-4
                      py-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          bg-linear-to-br
                          from-cyan-400
                          to-violet-500
                          font-black
                          text-black
                        "
                      >
                        {usuario.nombre
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>

                      <div className="min-w-0">
                        <p
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-white
                          "
                        >
                          {usuario.nombre}{" "}
                          {usuario.apellido}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-white/40
                          "
                        >
                          {usuario.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className="
                        mt-3
                        inline-flex
                        rounded-full
                        border
                        border-cyan-300/15
                        bg-cyan-400/8
                        px-3
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-cyan-300
                      "
                    >
                      {usuario.rol}
                    </span>
                  </div>


                  {/* OPCIONES */}
                  <div className="py-2">

                    <Link
                      to="/"
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        text-white/70
                        transition
                        hover:bg-white/6
                        hover:text-white
                      "
                    >
                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-white/5
                        "
                      >
                        ⌂
                      </span>

                      <span>
                        <span className="block font-semibold">
                          Página principal
                        </span>

                        <span
                          className="
                            mt-0.5
                            block
                            text-[11px]
                            text-white/30
                          "
                        >
                          Volver a GameZone
                        </span>
                      </span>
                    </Link>


                    <Link
                      to={getPanelPath()}
                      className="
                        mt-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        text-white/70
                        transition
                        hover:bg-cyan-400/8
                        hover:text-cyan-200
                      "
                    >
                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-cyan-400/10
                          text-cyan-300
                        "
                      >
                        ◈
                      </span>

                      <span>
                        <span className="block font-semibold">
                          {getPanelLabel()}
                        </span>

                        <span
                          className="
                            mt-0.5
                            block
                            text-[11px]
                            text-white/30
                          "
                        >
                          Gestionar mi cuenta
                        </span>
                      </span>
                    </Link>


                    <Link
                      to="/productos"
                      className="
                        mt-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        text-white/70
                        transition
                        hover:bg-violet-400/8
                        hover:text-violet-200
                      "
                    >
                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-violet-400/10
                          text-violet-300
                        "
                      >
                        ◉
                      </span>

                      <span>
                        <span className="block font-semibold">
                          Ver productos
                        </span>

                        <span
                          className="
                            mt-0.5
                            block
                            text-[11px]
                            text-white/30
                          "
                        >
                          Explorar catálogo
                        </span>
                      </span>
                    </Link>

                    <Link
                      to={getPqrPath()}
                      className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-amber-400/8 hover:text-amber-200"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">?</span>
                      <span>
                        <span className="block font-semibold">PQR / Soporte</span>
                        <span className="mt-0.5 block text-[11px] text-white/30">Solicitar ayuda o consultar casos</span>
                      </span>
                    </Link>

                  </div>


                  {/* LOGOUT */}
                  <div
                    className="
                      border-t
                      border-white/8
                      pt-2
                    "
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-4
                        py-3
                        text-left
                        text-sm
                        font-semibold
                        text-red-300/80
                        transition

                        hover:bg-red-400/10
                        hover:text-red-200
                      "
                    >
                      <span
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          bg-red-400/10
                        "
                      >
                        ↪
                      </span>

                      Cerrar sesión
                    </button>
                  </div>

                </div>
              )}
            </>
          ) : (

            <Link
              to="/login"
              className="
                group
                relative
                inline-flex
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-xl
                border
                border-white/20
                bg-white/8
                px-5
                py-3
                text-xs
                font-bold
                uppercase
                tracking-[0.08em]
                text-white
                shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_10px_30px_rgba(0,0,0,.25)]
                transition

                hover:-translate-y-0.5
                hover:border-cyan-300/50
                hover:bg-white/13

                sm:px-6
                sm:text-sm
              "
            >
              <span
                className="
                  pointer-events-none
                  absolute
                  left-[10%]
                  top-0
                  h-px
                  w-[80%]
                  bg-linear-to-r
                  from-transparent
                  via-cyan-300/80
                  to-violet-400/70
                "
              />

              <span className="relative z-10">
                Iniciar sesión
              </span>

              <span
                className="
                  relative
                  z-10
                  hidden
                  transition-transform
                  group-hover:translate-x-1
                  sm:inline
                "
              >
                →
              </span>

            </Link>
          )}

        </div>

      </div>

    </nav>
  );
}


export default Navbar;
