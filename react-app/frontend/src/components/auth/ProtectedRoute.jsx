import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

export function ProtectedRoute({
  children,
  roles = [],
}) {
  const {
    usuario,
    token,
  } = useAuth();

  if (
    !usuario ||
    !token
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles.length > 0 &&
    !roles.includes(
      usuario.rol
    )
  ) {
    if (
      usuario.rol ===
      "Administrador"
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    if (
      usuario.rol ===
      "Empleado"
    ) {
      return (
        <Navigate
          to="/empleado"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/cliente"
        replace
      />
    );
  }

  return children;
}