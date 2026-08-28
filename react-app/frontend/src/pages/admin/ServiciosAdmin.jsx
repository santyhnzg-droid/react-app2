import { useEffect, useState } from "react";

import {
  actualizarServicio,
  cambiarEstadoServicio,
  crearServicio,
  eliminarServicio,
  getServicios,
} from "../../services/api";
import { AdminShell } from "../../components/admin/AdminShell";

const initialForm = {
  nombre: "",
  descripcion: "",
  precio: "",
};

export function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const data = await getServicios();
      setServicios(data.servicios);
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

  const submit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...form,
        precio: Number(form.precio),
      };

      if (editingId) {
        await actualizarServicio(editingId, data);
      } else {
        await crearServicio(data);
      }

      setEditingId(null);
      setForm(initialForm);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const editar = (servicio) => {
    setEditingId(servicio.id);

    setForm({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? "",
      precio: servicio.precio,
    });
  };

  const estado = async (servicio) => {
    try {
      await cambiarEstadoServicio(
        servicio.id,
        servicio.estado === "activo"
          ? "inactivo"
          : "activo"
      );

      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar servicio?")) {
      return;
    }

    try {
      await eliminarServicio(id);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminShell
      eyebrow="GameZone Admin / Plataforma"
      title="Gestión de servicios"
      description="Mantén actualizada la oferta de servicios disponibles para los clientes de GameZone."
    >
      <div className="mx-auto max-w-6xl">

        <form
          onSubmit={submit}
          className="mb-10 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:grid-cols-2"
        >
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            required
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />

          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            placeholder="Precio"
            min="0"
            required
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />

          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:col-span-2"
          />

          <button className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-6 py-3 text-cyan-200">
            {editingId ? "Actualizar" : "Crear"}
          </button>
        </form>

        {error && (
          <p className="mb-5 text-red-300">
            {error}
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {servicios.map((servicio) => (
            <article
              key={servicio.id}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
            >
              <span className="text-xs text-cyan-300/60">
                #{servicio.id}
              </span>

              <h2 className="mt-3 text-2xl font-semibold">
                {servicio.nombre}
              </h2>

              <p className="mt-3 text-sm text-white/40">
                {servicio.descripcion}
              </p>

              <p className="mt-5 text-xl">
                $
                {Number(
                  servicio.precio
                ).toLocaleString("es-CO")}
              </p>

              <p className="mt-2 text-sm text-white/40">
                Estado: {servicio.estado}
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => editar(servicio)}
                  className="rounded-lg bg-blue-400/10 px-3 py-2 text-blue-300"
                >
                  Editar
                </button>

                <button
                  onClick={() => estado(servicio)}
                  className="rounded-lg bg-yellow-400/10 px-3 py-2 text-yellow-300"
                >
                  Estado
                </button>

                <button
                  onClick={() =>
                    eliminar(servicio.id)
                  }
                  className="rounded-lg bg-red-400/10 px-3 py-2 text-red-300"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}