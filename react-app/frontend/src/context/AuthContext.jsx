import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getUsuarioActual,
} from "../services/api";


const AuthContext = createContext(null);


export function AuthProvider({
  children,
}) {
  const [usuario, setUsuario] =
    useState(() => {
      try {
        const stored =
          localStorage.getItem(
            "gamezone_usuario"
          );

        return stored
          ? JSON.parse(stored)
          : null;
      } catch {
        return null;
      }
    });

  const [token, setToken] =
    useState(() =>
      localStorage.getItem(
        "gamezone_token"
      )
    );

  const [cargando, setCargando] =
    useState(true);


  function cerrarSesion() {
    localStorage.removeItem(
      "gamezone_usuario"
    );

    localStorage.removeItem(
      "gamezone_token"
    );

    setUsuario(null);
    setToken(null);
  }


  function iniciarSesion(result) {
    if (
      !result?.token ||
      !result?.usuario
    ) {
      throw new Error(
        "Respuesta de inicio de sesión inválida."
      );
    }

    localStorage.setItem(
      "gamezone_token",
      result.token
    );

    localStorage.setItem(
      "gamezone_usuario",
      JSON.stringify(
        result.usuario
      )
    );

    setToken(result.token);
    setUsuario(result.usuario);
  }


  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      const storedToken =
        localStorage.getItem(
          "gamezone_token"
        );

      if (!storedToken) {
        if (mounted) {
          setCargando(false);
        }
        return;
      }

      try {
        const result =
          await getUsuarioActual();

        if (!mounted) {
          return;
        }

        setUsuario(
          result.usuario
        );

        setToken(
          storedToken
        );

        localStorage.setItem(
          "gamezone_usuario",
          JSON.stringify(
            result.usuario
          )
        );
      } catch {
        if (mounted) {
          cerrarSesion();
        }
      } finally {
        if (mounted) {
          setCargando(false);
        }
      }
    }

    validateSession();

    return () => {
      mounted = false;
    };
  }, []);


  const value = useMemo(
    () => ({
      usuario,
      user: usuario,
      token,
      cargando,
      loading: cargando,
      autenticado:
        Boolean(usuario && token),
      isAuthenticated:
        Boolean(usuario && token),
      iniciarSesion,
      login: iniciarSesion,
      cerrarSesion,
      logout: cerrarSesion,
    }),
    [
      usuario,
      token,
      cargando,
    ]
  );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de AuthProvider."
    );
  }

  return context;
}


export default AuthContext;
