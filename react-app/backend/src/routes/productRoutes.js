import {
  Router,
} from "express";

import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  changeProductoEstado,
  deleteProducto,
} from "../controllers/productController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  allowRoles,
} from "../middleware/roleMiddleware.js";

import {
  uploadProductImage,
} from "../middleware/uploadMiddleware.js";

const router = Router();

/* =========================
   PRODUCTOS PÚBLICOS
========================= */

router.get(
  "/",
  getProductos
);

/* =========================
   SUBIR IMAGEN
   IMPORTANTE:
   debe estar antes de /:id
========================= */

router.post(
  "/upload-image",

  authMiddleware,

  allowRoles(
    "Administrador"
  ),

  uploadProductImage.single(
    "imagen"
  ),

  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({
          ok: false,
          message:
            "No se recibió ninguna imagen.",
        });
    }

    return res.json({
      ok: true,

      message:
        "Imagen subida correctamente.",

      filename:
        req.file.filename,

      url:
        `http://localhost:3000/uploads/products/${req.file.filename}`,
    });
  }
);

/* =========================
   PRODUCTO INDIVIDUAL
========================= */

router.get(
  "/:id",
  getProductoById
);

/* =========================
   CREAR
========================= */

router.post(
  "/",

  authMiddleware,

  allowRoles(
    "Administrador"
  ),

  createProducto
);

/* =========================
   ACTUALIZAR
========================= */

router.put(
  "/:id",

  authMiddleware,

  allowRoles(
    "Administrador"
  ),

  updateProducto
);

/* =========================
   ESTADO
========================= */

router.patch(
  "/:id/estado",

  authMiddleware,

  allowRoles(
    "Administrador"
  ),

  changeProductoEstado
);

/* =========================
   ELIMINAR
========================= */

router.delete(
  "/:id",

  authMiddleware,

  allowRoles(
    "Administrador"
  ),

  deleteProducto
);

export default router;