import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { pool } from "../config/db.js";

const userFields = `
  u.id,
  u.nombre,
  u.apellido,
  u.email,
  u.telefono,
  u.direccion,
  u.tipo_documento,
  u.numero_documento,
  u.estado,
  u.rol_id,
  r.nombre AS rol
`;

function createToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

async function findUserById(id) {
  const [usuarios] = await pool.query(
    `SELECT ${userFields}
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  return usuarios[0];
}

export async function register(req, res) {
  try {
    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      email,
      password,
    } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !tipo_documento ||
        !numero_documento?.trim() || !direccion?.trim() ||
        !telefono?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son obligatorios.",
      });
    }

    const [roles] = await pool.query(
      "SELECT id FROM roles WHERE nombre = 'Cliente' LIMIT 1"
    );

    if (roles.length === 0) {
      return res.status(500).json({
        ok: false,
        message: "El rol Cliente no está configurado.",
      });
    }

    const [existentes] = await pool.query(
      `SELECT id FROM usuarios
       WHERE email = ? OR numero_documento = ?
       LIMIT 1`,
      [email.trim().toLowerCase(), numero_documento.trim()]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "El correo o número de documento ya está registrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO usuarios
       (nombre, apellido, tipo_documento, numero_documento, direccion,
        telefono, email, password, rol_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        apellido.trim(),
        tipo_documento,
        numero_documento.trim(),
        direccion.trim(),
        telefono.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        roles[0].id,
      ]
    );

    const usuario = await findUserById(result.insertId);

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente.",
      usuario,
    });
  } catch (error) {
    console.error("Error register:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al registrar el usuario.",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        ok: false,
        message: "El correo y la contraseña son obligatorios.",
      });
    }

    const [usuarios] = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (usuarios.length === 0 ||
        !(await bcrypt.compare(password, usuarios[0].password))) {
      return res.status(401).json({
        ok: false,
        message: "Correo o contraseña incorrectos.",
      });
    }

    if (usuarios[0].estado !== "activo") {
      return res.status(403).json({
        ok: false,
        message: "El usuario está inactivo.",
      });
    }

    const usuario = await findUserById(usuarios[0].id);

    return res.json({
      ok: true,
      token: createToken(usuario),
      usuario,
    });
  } catch (error) {
    console.error("Error login:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al iniciar sesión.",
    });
  }
}

export async function me(req, res) {
  try {
    const [usuarios] =
      await pool.query(
        `
        SELECT
          u.id,
          u.nombre,
          u.apellido,
          u.email,
          u.telefono,
          u.direccion,
          u.tipo_documento,
          u.numero_documento,
          u.estado,
          u.rol_id,
          r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r
          ON r.id = u.rol_id
        WHERE u.id = ?
        LIMIT 1
        `,
        [req.usuario.id]
      );

    if (
      usuarios.length === 0
    ) {
      return res.status(404).json({
        ok: false,
        message:
          "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      usuario:
        usuarios[0],
    });
  } catch (error) {
    console.error(
      "Error me:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Error al consultar el usuario.",
    });
  }
}