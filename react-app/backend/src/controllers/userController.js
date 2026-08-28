import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

const validRoles = [1, 2, 3];

function validarUsuario(data, editing = false) {
  const {
    nombre,
    apellido,
    tipo_documento,
    numero_documento,
    direccion,
    telefono,
    email,
    password,
    rol_id,
  } = data;

  if (!nombre?.trim()) return "El nombre es obligatorio.";
  if (!apellido?.trim()) return "El apellido es obligatorio.";

  if (!tipo_documento) {
    return "El tipo de documento es obligatorio.";
  }

  if (!/^[0-9]{6,12}$/.test(numero_documento ?? "")) {
    return "El documento debe tener entre 6 y 12 números.";
  }

  if (!direccion?.trim()) {
    return "La dirección es obligatoria.";
  }

  if (!/^[0-9]{10}$/.test(telefono ?? "")) {
    return "El teléfono debe contener 10 números.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? "")) {
    return "El correo electrónico no es válido.";
  }

  if (!editing && !password) {
    return "La contraseña es obligatoria.";
  }

  if (password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/;

    if (!regex.test(password)) {
      return "La contraseña debe incluir mayúscula, minúscula, número y mínimo 8 caracteres.";
    }
  }

  if (!validRoles.includes(Number(rol_id))) {
    return "El rol seleccionado no es válido.";
  }

  return null;
}

export async function getUsuarios(req, res) {
  try {
    const [usuarios] = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.tipo_documento,
        u.numero_documento,
        u.direccion,
        u.telefono,
        u.email,
        u.estado,
        u.rol_id,
        r.nombre AS rol,
        u.created_at,
        u.updated_at
      FROM usuarios u
      INNER JOIN roles r ON r.id = u.rol_id
      ORDER BY u.id DESC
    `);

    return res.json({
      ok: true,
      usuarios,
    });
  } catch (error) {
    console.error("getUsuarios:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar usuarios.",
    });
  }
}

export async function getUsuarioById(req, res) {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      `
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.tipo_documento,
        u.numero_documento,
        u.direccion,
        u.telefono,
        u.email,
        u.estado,
        u.rol_id,
        r.nombre AS rol
      FROM usuarios u
      INNER JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ?
      `,
      [id]
    );

    if (!usuarios.length) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      usuario: usuarios[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Error al consultar usuario.",
    });
  }
}

export async function createUsuario(req, res) {
  try {
    const error = validarUsuario(req.body);

    if (error) {
      return res.status(400).json({
        ok: false,
        message: error,
      });
    }

    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      email,
      password,
      rol_id,
    } = req.body;

    const [duplicados] = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE email = ?
      OR numero_documento = ?
      `,
      [
        email.toLowerCase().trim(),
        numero_documento,
      ]
    );

    if (duplicados.length) {
      return res.status(409).json({
        ok: false,
        message:
          "El correo o documento ya está registrado.",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO usuarios
      (
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        direccion,
        telefono,
        email,
        password,
        rol_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombre.trim(),
        apellido.trim(),
        tipo_documento,
        numero_documento,
        direccion.trim(),
        telefono,
        email.toLowerCase().trim(),
        hash,
        Number(rol_id),
      ]
    );

    return res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear usuario.",
    });
  }
}

export async function updateUsuario(req, res) {
  try {
    const { id } = req.params;

    const [actuales] = await pool.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );

    if (!actuales.length) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    const actual = actuales[0];

    const data = {
      ...req.body,
      password: req.body.password || undefined,
    };

    const error = validarUsuario(data, true);

    if (error) {
      return res.status(400).json({
        ok: false,
        message: error,
      });
    }

    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      email,
      password,
      rol_id,
    } = data;

    const [duplicados] = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE
        (email = ? OR numero_documento = ?)
        AND id <> ?
      `,
      [
        email.toLowerCase().trim(),
        numero_documento,
        id,
      ]
    );

    if (duplicados.length) {
      return res.status(409).json({
        ok: false,
        message:
          "El correo o documento pertenece a otro usuario.",
      });
    }

    let passwordFinal = actual.password;

    if (password) {
      passwordFinal = await bcrypt.hash(password, 10);
    }

    await pool.query(
      `
      UPDATE usuarios
      SET
        nombre = ?,
        apellido = ?,
        tipo_documento = ?,
        numero_documento = ?,
        direccion = ?,
        telefono = ?,
        email = ?,
        password = ?,
        rol_id = ?
      WHERE id = ?
      `,
      [
        nombre.trim(),
        apellido.trim(),
        tipo_documento,
        numero_documento,
        direccion.trim(),
        telefono,
        email.toLowerCase().trim(),
        passwordFinal,
        Number(rol_id),
        id,
      ]
    );

    return res.json({
      ok: true,
      message: "Usuario actualizado correctamente.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar usuario.",
    });
  }
}

export async function changeUsuarioEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["activo", "inactivo"].includes(estado)) {
      return res.status(400).json({
        ok: false,
        message:
          "El estado debe ser activo o inactivo.",
      });
    }

    if (Number(id) === Number(req.usuario.id)) {
      return res.status(400).json({
        ok: false,
        message:
          "No puedes desactivar tu propia cuenta.",
      });
    }

    const [result] = await pool.query(
      "UPDATE usuarios SET estado = ? WHERE id = ?",
      [estado, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Estado actualizado correctamente.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Error al cambiar estado.",
    });
  }
}

export async function deleteUsuario(req, res) {
  try {
    const { id } = req.params;

    if (Number(id) === Number(req.usuario.id)) {
      return res.status(400).json({
        ok: false,
        message:
          "No puedes eliminar tu propia cuenta.",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado.",
      });
    }

    return res.json({
      ok: true,
      message: "Usuario eliminado correctamente.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: "Error al eliminar usuario.",
    });
  }
}