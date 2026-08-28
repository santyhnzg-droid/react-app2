import dotenv from "dotenv";
import app from "./src/app.js";
import { pool } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log("✅ Conexión a MySQL correcta");

    connection.release();

    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor ejecutándose en http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Error conectando con MySQL:",
      error.message
    );
  }
}

startServer();