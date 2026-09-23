import { useEffect, useState } from "react";

import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  eliminarUsuario,
  getUsuarios,
} from "../../services/api";
import { AdminShell } from "../../components/admin/AdminShell";

const initialForm = {
  nombre: "",
  apellido: "",
  tipo_documento: "CC",
  numero_documento: "",
  direccion: "",
  telefono: "",
  email: "",
  password: "",
  rol_id: "3",
};

export function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const cargar = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data.usuarios);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleChange = ({ target }) => {
    setForm((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const limpiar = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      setError("");
      setMensaje("");

      const data = {
        ...form,
        rol_id: Number(form.rol_id),
      };

      // La contraseña es opcional al editar. No envíes una cadena vacía.
      if (editingId && !data.password.trim()) {
        delete data.password;
      }

      if (editingId) {
        await actualizarUsuario(editingId, data);
        setMensaje("Usuario actualizado.");
      } else {
        await crearUsuario(data);
        setMensaje("Usuario creado.");
      }

      limpiar();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editar = (usuario) => {
    setEditingId(usuario.id);
    setShowForm(true);

    setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      tipo_documento: usuario.tipo_documento,
      numero_documento: usuario.numero_documento,
      direccion: usuario.direccion,
      telefono: usuario.telefono,
      email: usuario.email,
      password: "",
      rol_id: String(usuario.rol_id),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const estado = async (usuario) => {
    try {
      await cambiarEstadoUsuario(
        usuario.id,
        usuario.estado === "activo"
          ? "inactivo"
          : "activo"
      );

      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (usuario) => {
    if (
      !window.confirm(
        `¿Eliminar a ${usuario.nombre}?`
      )
    ) {
      return;
    }

    try {
      await eliminarUsuario(usuario.id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40";
  const totalPages = Math.max(1, Math.ceil(usuarios.length / pageSize));
  const visibleUsuarios = usuarios.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminShell
      eyebrow="GameZone Admin / Seguridad"
      title="Gestión de usuarios"
      description="Administra perfiles, roles y estados de las cuentas que tienen acceso a la plataforma."
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/60">Usuarios</p>
            <p className="mt-2 text-sm text-white/40">{usuarios.length} cuentas registradas</p>
          </div>
          <button type="button" onClick={() => { limpiar(); setShowForm(true); }} className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-[#031016] transition hover:bg-cyan-200">+ Nuevo usuario</button>
        </div>

        {showForm && <section className="mb-10 rounded-3xl border border-cyan-300/15 bg-[#080b11]/90 p-7 shadow-2xl shadow-black/20">
          <h2 className="mb-6 text-2xl font-semibold">
            {editingId
              ? "Editar usuario"
              : "Nuevo usuario"}
          </h2>

          <form
            onSubmit={submit}
            className="grid gap-5 md:grid-cols-2"
          >
            <input
              className={fieldClass}
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />

            <input
              className={fieldClass}
              name="apellido"
              placeholder="Apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />

            <select
              className={fieldClass}
              name="tipo_documento"
              value={form.tipo_documento}
              onChange={handleChange}
            >
              <option value="CC">Cédula</option>
              <option value="TI">
                Tarjeta identidad
              </option>
              <option value="CE">
                Cédula extranjería
              </option>
              <option value="PAS">
                Pasaporte
              </option>
            </select>

            <input
              className={fieldClass}
              name="numero_documento"
              placeholder="Documento"
              value={form.numero_documento}
              onChange={handleChange}
              required
            />

            <input
              className={fieldClass}
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              required
            />

            <input
              className={fieldClass}
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
              required
            />

            <input
              className={fieldClass}
              type="email"
              name="email"
              placeholder="Correo"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              className={fieldClass}
              type="password"
              name="password"
              placeholder={
                editingId
                  ? "Nueva contraseña (opcional)"
                  : "Contraseña"
              }
              value={form.password}
              onChange={handleChange}
              required={!editingId}
            />

            <select
              className={fieldClass}
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
            >
              <option value="1">
                Administrador
              </option>

              <option value="2">
                Empleado
              </option>

              <option value="3">
                Cliente
              </option>
            </select>

            <div className="flex gap-3 md:col-span-2">
              <button disabled={saving} className="rounded-xl bg-cyan-300 px-6 py-3 font-bold text-[#031016] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-50">
                {saving ? "Guardando..." : editingId ? "Actualizar usuario" : "Crear usuario"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={limpiar}
                  className="rounded-xl border border-white/10 px-6 py-3"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {mensaje && (
            <p className="mt-5 text-emerald-300">
              {mensaje}
            </p>
          )}

          {error && (
            <p className="mt-5 text-red-300">
              {error}
            </p>
          )}
        </section>}

        <section className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-237.5 text-left text-sm">
            <thead className="bg-white/5 text-white/40">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Documento</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {visibleUsuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-white/5"
                >
                  <td className="p-4 font-medium">
                    {usuario.nombre}{" "}
                    {usuario.apellido}
                  </td>

                  <td className="p-4 text-white/60">
                    {usuario.email}
                  </td>

                  <td className="p-4">
                    {usuario.numero_documento}
                  </td>

                  <td className="p-4">
                    {usuario.rol}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        usuario.estado === "activo"
                          ? "text-emerald-300"
                          : "text-red-300"
                      }
                    >
                      {usuario.estado}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editar(usuario)}
                        className="rounded-lg bg-blue-400/10 px-3 py-2 text-blue-300"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => estado(usuario)}
                        className="rounded-lg bg-yellow-400/10 px-3 py-2 text-yellow-300"
                      >
                        Estado
                      </button>

                      <button
                        onClick={() => eliminar(usuario)}
                        className="rounded-lg bg-red-400/10 px-3 py-2 text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/60">
          <span>Mostrando {visibleUsuarios.length} de {usuarios.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30">Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30">Siguiente</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
