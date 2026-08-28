import { Router } from "express";

import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  changeUsuarioEstado,
  deleteUsuario,
} from "../controllers/userController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(
  authMiddleware,
  allowRoles("Administrador")
);

router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.patch("/:id/estado", changeUsuarioEstado);
router.delete("/:id", deleteUsuario);

export default router;