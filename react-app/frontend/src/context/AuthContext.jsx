import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [usuario, setUsuario] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "gamezone_usuario"
        );

      return saved
        ? JSON.parse(saved)
        : null;
    });

  const [token, setToken] =
    useState(() =>
      localStorage.getItem(
        "gamezone_token"
      )
    );

  const iniciarSesion = (
    data
  ) => {
    setUsuario(
      data.usuario
    );

    setToken(
      data.token
    );

    localStorage.setItem(
      "gamezone_usuario",
      JSON.stringify(
        data.usuario
      )
    );

    localStorage.setItem(
      "gamezone_token",
      data.token
    );
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);

    localStorage.removeItem(
      "gamezone_usuario"
    );

    localStorage.removeItem(
      "gamezone_token"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}