import { pool } from "../config/db.js";

export async function createSale(req, res) {
  const connection = await pool.getConnection();

  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "La venta debe incluir al menos un producto.",
      });
    }

    const normalizedItems = items.map((item) => ({
      producto_id: Number(item.producto_id),
      cantidad: Number(item.cantidad),
    }));

    if (normalizedItems.some((item) =>
      !Number.isInteger(item.producto_id) ||
      item.producto_id <= 0 ||
      !Number.isInteger(item.cantidad) ||
      item.cantidad <= 0
    )) {
      return res.status(400).json({
        ok: false,
        message: "Los productos y cantidades de la venta no son válidos.",
      });
    }

    const quantities = new Map();
    for (const item of normalizedItems) {
      quantities.set(
        item.producto_id,
        (quantities.get(item.producto_id) || 0) + item.cantidad
      );
    }

    await connection.beginTransaction();

    const lockedProducts = [];
    for (const [productId, quantity] of quantities) {
      const [products] = await connection.query(
        `SELECT id, nombre, precio, stock
         FROM productos
         WHERE id = ? AND estado = 'activo'
         FOR UPDATE`,
        [productId]
      );

      if (products.length === 0) {
        throw new Error(`El producto #${productId} no está disponible.`);
      }

      const product = products[0];
      if (product.stock < quantity) {
        throw new Error(
          `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}.`
        );
      }

      lockedProducts.push({ ...product, cantidad: quantity });
    }

    const total = lockedProducts.reduce(
      (sum, product) => sum + Number(product.precio) * product.cantidad,
      0
    );

    const [saleResult] = await connection.query(
      `INSERT INTO ventas (usuario_id, total) VALUES (?, ?)`,
      [req.usuario.id, total]
    );

    for (const product of lockedProducts) {
      const subtotal = Number(product.precio) * product.cantidad;

      await connection.query(
        `INSERT INTO venta_detalles
         (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [saleResult.insertId, product.id, product.cantidad, product.precio, subtotal]
      );

      await connection.query(
        `UPDATE productos SET stock = stock - ? WHERE id = ?`,
        [product.cantidad, product.id]
      );
    }

    await connection.commit();

    return res.status(201).json({
      ok: true,
      message: "Venta registrada correctamente.",
      venta: {
        id: saleResult.insertId,
        total,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error createSale:", error);

    return res.status(400).json({
      ok: false,
      message: error.message || "No fue posible registrar la venta.",
    });
  } finally {
    connection.release();
  }
}
