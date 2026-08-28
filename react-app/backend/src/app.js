import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";

const app = express();

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin:
      "http://localhost:5173",
  })
);

/* =========================
   JSON
========================= */

app.use(
  express.json()
);

/* =========================
   IMÁGENES PÚBLICAS
========================= */

app.use(
  "/uploads",

  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/* =========================
   API TEST
========================= */

app.get(
  "/",
  (req, res) => {
    res.json({
      ok: true,
      message:
        "API GameZone funcionando",
    });
  }
);

/* =========================
   RUTAS
========================= */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/productos",
  productRoutes
);

app.use(
  "/api/usuarios",
  userRoutes
);

app.use(
  "/api/servicios",
  serviceRoutes
);

app.use(
  "/api/ventas",
  saleRoutes
);

/* =========================
   404
========================= */

app.use(
  (req, res) => {
    res.status(404).json({
      ok: false,
      message:
        "Ruta no encontrada.",
    });
  }
);

/* =========================
   MANEJO DE ERRORES
========================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Error servidor:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            message:
              "La imagen no puede superar los 5 MB.",
          });
      }

      return res
        .status(400)
        .json({
          ok: false,
          message:
            "Error al subir la imagen.",
        });
    }

    if (
      error.message?.includes(
        "Solo se permiten imágenes"
      )
    ) {
      return res
        .status(400)
        .json({
          ok: false,
          message:
            error.message,
        });
    }

    return res
      .status(500)
      .json({
        ok: false,
        message:
          "Error interno del servidor.",
      });
  }
);

export default app;