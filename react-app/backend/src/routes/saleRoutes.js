import { Router } from "express";

import { createSale } from "../controllers/saleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("Administrador", "Empleado", "Cliente"),
  createSale
);

export default router;
