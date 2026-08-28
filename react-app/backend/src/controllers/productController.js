import { pool } from "../config/db.js";

/* =========================
   LISTAR PRODUCTOS
========================= */

export async function getProductos(req, res) {
  try {
    const [productos] = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        p.estado,
        p.categoria_id,
        c.nombre AS categoria,
        p.created_at,
        p.updated_at
      FROM productos p
      LEFT JOIN categorias c
        ON c.id = p.categoria_id
      ORDER BY p.id ASC
    `);

    return res.json({
      ok: true,
      productos,
    });
  } catch (error) {
    console.error("Error getProductos:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar productos.",
    });
  }
}

/* =========================
   CONSULTAR PRODUCTO
========================= */

export async function getProductoById(req, res) {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(
      `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        p.estado,
        p.categoria_id,
        c.nombre AS categoria,
        p.created_at,
        p.updated_at
      FROM productos p
      LEFT JOIN categorias c
        ON c.id = p.categoria_id
      WHERE p.id = ?
      `,
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado.",
      });
    }

    return res.json({
      ok: true,
      producto: productos[0],
    });
  } catch (error) {
    console.error("Error getProductoById:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar el producto.",
    });
  }
}

/* =========================
   CREAR PRODUCTO
========================= */

export async function createProducto(req, res) {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      categoria_id,
    } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre es obligatorio.",
      });
    }

    if (nombre.trim().length > 120) {
      return res.status(400).json({
        ok: false,
        message: "El nombre no puede superar 120 caracteres.",
      });
    }

    if (
      precio === undefined ||
      Number.isNaN(Number(precio)) ||
      Number(precio) < 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "El precio no es válido.",
      });
    }

    if (
      stock === undefined ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "El stock debe ser un entero mayor o igual a 0.",
      });
    }

    if (categoria_id) {
      const [categorias] = await pool.query(
        `
        SELECT id
        FROM categorias
        WHERE id = ?
        AND estado = 'activo'
        `,
        [categoria_id]
      );

      if (categorias.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "La categoría seleccionada no existe.",
        });
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO productos
      (
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        categoria_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        nombre.trim(),
        descripcion?.trim() || null,
        Number(precio),
        Number(stock),
        imagen?.trim() || null,
        categoria_id || null,
      ]
    );

    const [productos] = await pool.query(
      `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        p.estado,
        p.categoria_id,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c
        ON c.id = p.categoria_id
      WHERE p.id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: "Producto creado correctamente.",
      producto: productos[0],
    });
  } catch (error) {
    console.error("Error createProducto:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear el producto.",
    });
  }
}

/* =========================
   ACTUALIZAR PRODUCTO
========================= */

export async function updateProducto(req, res) {
  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      categoria_id,
    } = req.body;

    const [existente] = await pool.query(
      `
      SELECT id
      FROM productos
      WHERE id = ?
      `,
      [id]
    );

    if (existente.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado.",
      });
    }

    if (!nombre?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre es obligatorio.",
      });
    }

    if (
      Number.isNaN(Number(precio)) ||
      Number(precio) < 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "El precio no es válido.",
      });
    }

    if (
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        ok: false,
        message: "El stock no es válido.",
      });
    }

    if (categoria_id) {
      const [categorias] = await pool.query(
        `
        SELECT id
        FROM categorias
        WHERE id = ?
        `,
        [categoria_id]
      );

      if (categorias.length === 0) {
        return res.status(400).json({
          ok: false,
          message: "La categoría seleccionada no existe.",
        });
      }
    }

    await pool.query(
      `
      UPDATE productos
      SET
        nombre = ?,
        descripcion = ?,
        precio = ?,
        stock = ?,
        imagen = ?,
        categoria_id = ?
      WHERE id = ?
      `,
      [
        nombre.trim(),
        descripcion?.trim() || null,
        Number(precio),
        Number(stock),
        imagen?.trim() || null,
        categoria_id || null,
        id,
      ]
    );

    const [productos] = await pool.query(
      `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        p.estado,
        p.categoria_id,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c
        ON c.id = p.categoria_id
      WHERE p.id = ?
      `,
      [id]
    );

    return res.json({
      ok: true,
      message: "Producto actualizado correctamente.",
      producto: productos[0],
    });
  } catch (error) {
    console.error("Error updateProducto:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar el producto.",
    });
  }
}

/* =========================
   CAMBIAR ESTADO
========================= */

export async function changeProductoEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({
        ok: false,
        message: "El estado debe ser activo o inactivo.",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE productos
      SET estado = ?
      WHERE id = ?
      `,
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Estado actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error changeProductoEstado:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al cambiar el estado.",
    });
  }
}

/* =========================
   ELIMINAR PRODUCTO
========================= */

export async function deleteProducto(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
      DELETE FROM productos
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Producto eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error deleteProducto:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al eliminar el producto.",
    });
  }
}