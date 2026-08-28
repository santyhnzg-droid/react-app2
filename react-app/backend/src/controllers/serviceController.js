import { pool } from "../config/db.js";

export async function getServicios(req, res) {
  try {
    const [servicios] = await pool.query(`
      SELECT *
      FROM servicios
      ORDER BY id DESC
    `);

    return res.json({
      ok: true,
      servicios,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar servicios.",
    });
  }
}

export async function getServicioById(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM servicios WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado.",
      });
    }

    return res.json({
      ok: true,
      servicio: rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al consultar servicio.",
    });
  }
}

export async function createServicio(req, res) {
  try {
    const {
      nombre,
      descripcion,
      precio,
    } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre es obligatorio.",
      });
    }

    if (
      precio === undefined ||
      Number(precio) < 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "El precio no es válido.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO servicios
      (nombre, descripcion, precio)
      VALUES (?, ?, ?)
      `,
      [
        nombre.trim(),
        descripcion?.trim() || null,
        Number(precio),
      ]
    );

    return res.status(201).json({
      ok: true,
      message: "Servicio creado correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al crear servicio.",
    });
  }
}

export async function updateServicio(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
    } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre es obligatorio.",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE servicios
      SET nombre = ?,
          descripcion = ?,
          precio = ?
      WHERE id = ?
      `,
      [
        nombre.trim(),
        descripcion?.trim() || null,
        Number(precio),
        id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Servicio actualizado correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar servicio.",
    });
  }
}

export async function changeServicioEstado(req, res) {
  try {
    const { estado } = req.body;

    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({
        ok: false,
        message: "Estado inválido.",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE servicios
      SET estado = ?
      WHERE id = ?
      `,
      [estado, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Estado actualizado correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al cambiar estado.",
    });
  }
}

export async function deleteServicio(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM servicios WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Servicio eliminado correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al eliminar servicio.",
    });
  }
}