import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        ok: false,
        message:
          "No se proporcionó un token de autenticación.",
      });
    }

    const token =
      authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        message:
          "Token de autenticación requerido.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = decoded;

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        ok: false,
        message:
          "La sesión ha expirado.",
      });
    }

    return res.status(401).json({
      ok: false,
      message:
        "Token inválido.",
    });
  }
}