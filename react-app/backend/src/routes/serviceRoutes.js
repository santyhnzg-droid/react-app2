import { Router } from "express";

import {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  changeServicioEstado,
  deleteServicio,
} from "../controllers/serviceController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", getServicios);
router.get("/:id", getServicioById);

router.post(
  "/",
  authMiddleware,
  allowRoles("Administrador"),
  createServicio
);

router.put(
  "/:id",
  authMiddleware,
  allowRoles("Administrador"),
  updateServicio
);

router.patch(
  "/:id/estado",
  authMiddleware,
  allowRoles("Administrador"),
  changeServicioEstado
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("Administrador"),
  deleteServicio
);

export default router;