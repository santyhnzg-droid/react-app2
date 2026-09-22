import {
  useEffect,
  useState,
} from "react";

import {
  actualizarProducto,
  cambiarEstadoProducto,
  crearProducto,
  eliminarProducto,
  BACKEND_URL,
  getProductos,
  subirImagenProducto,
} from "../../services/api";
import { AdminShell } from "../../components/admin/AdminShell";

const initialForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  imagen: "",
  categoria_id: "1",
};

const categorias = [
  {
    id: 1,
    nombre: "Accion",
  },
  {
    id: 2,
    nombre: "Aventura",
  },
  {
    id: 3,
    nombre: "Mundo abierto",
  },
  {
    id: 4,
    nombre: "Supervivencia",
  },
];

function getImageUrl(
  imagen
) {
  if (!imagen) {
    return "";
  }

  if (
    imagen.startsWith(
      "http://"
    ) ||
    imagen.startsWith(
      "https://"
    )
  ) {
    return imagen;
  }

  return `${BACKEND_URL}/uploads/products/${imagen}`;
}

export function ProductosAdmin() {
  const [
    productos,
    setProductos,
  ] = useState([]);

  const [
    form,
    setForm,
  ] = useState(
    initialForm
  );

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* =========================
     CARGAR PRODUCTOS
  ========================= */

  const cargarProductos =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProductos();

        setProductos(
          Array.isArray(
            data.productos
          )
            ? data.productos
            : []
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "No fue posible cargar los productos."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    cargarProductos();
  }, []);

  /* =========================
     INPUTS
  ========================= */

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm(
      (prev) => ({
        ...prev,
        [name]:
          value,
      })
    );

    setError("");
    setMensaje("");
  };

  /* =========================
     IMAGEN
  ========================= */

  const handleImageChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Solo puedes subir imágenes JPG, JPEG, PNG o WEBP."
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "La imagen no puede superar los 5 MB."
      );

      e.target.value = "";

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const preview =
      URL.createObjectURL(
        file
      );

    setImageFile(file);
    setImagePreview(
      preview
    );

    setError("");
  };

  /* =========================
     LIMPIAR
  ========================= */

  const limpiarFormulario =
    () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setForm(
        initialForm
      );

      setEditingId(
        null
      );

      setImageFile(
        null
      );

      setImagePreview(
        ""
      );

      setShowForm(false);
    };

  /* =========================
     GUARDAR
  ========================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setSaving(true);
      setMensaje("");
      setError("");

      try {
        let imagenFinal =
          form.imagen;

        /* =====================
           SUBIR IMAGEN NUEVA
        ===================== */

        if (imageFile) {
          try {
            setUploadingImage(
              true
            );

            const uploadResult =
              await subirImagenProducto(
                imageFile
              );

            imagenFinal =
              uploadResult.filename;
          } finally {
            setUploadingImage(
              false
            );
          }
        }

        /* =====================
           IMAGEN OBLIGATORIA
           AL CREAR
        ===================== */

        if (
          !editingId &&
          !imagenFinal
        ) {
          throw new Error(
            "Debes seleccionar una imagen para el producto."
          );
        }

        const producto = {
          nombre:
            form.nombre.trim(),

          descripcion:
            form.descripcion.trim(),

          precio:
            Number(
              form.precio
            ),

          stock:
            Number(
              form.stock
            ),

          imagen:
            imagenFinal,

          categoria_id:
            Number(
              form.categoria_id
            ),
        };

        if (editingId) {
          await actualizarProducto(
            editingId,
            producto
          );

          setMensaje(
            "Producto actualizado correctamente."
          );
        } else {
          await crearProducto(
            producto
          );

          setMensaje(
            "Producto creado correctamente."
          );
        }

        limpiarFormulario();

        await cargarProductos();
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Ocurrió un error al guardar el producto."
        );
      } finally {
        setSaving(false);
        setUploadingImage(
          false
        );
      }
    };

  /* =========================
     EDITAR
  ========================= */

  const editarProducto = (
    producto
  ) => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setEditingId(
      producto.id
    );

    setShowForm(true);

    setImageFile(
      null
    );

    setImagePreview(
      ""
    );

    setForm({
      nombre:
        producto.nombre ?? "",

      descripcion:
        producto.descripcion ??
        "",

      precio:
        producto.precio ?? "",

      stock:
        producto.stock ?? "",

      imagen:
        producto.imagen ?? "",

      categoria_id:
        String(
          producto.categoria_id ??
            1
        ),
    });

    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  };

  /* =========================
     ESTADO
  ========================= */

  const toggleEstado =
    async (
      producto
    ) => {
      try {
        setError("");
        setMensaje("");

        const nuevoEstado =
          producto.estado ===
          "activo"
            ? "inactivo"
            : "activo";

        await cambiarEstadoProducto(
          producto.id,
          nuevoEstado
        );

        setMensaje(
          nuevoEstado ===
          "activo"
            ? "Producto activado correctamente."
            : "Producto desactivado correctamente."
        );

        await cargarProductos();
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  /* =========================
     ELIMINAR
  ========================= */

  const eliminar =
    async (
      producto
    ) => {
      const confirmar =
        window.confirm(
          `¿Seguro que deseas eliminar "${producto.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        setError("");
        setMensaje("");

        await eliminarProducto(
          producto.id
        );

        setMensaje(
          "Producto eliminado correctamente."
        );

        await cargarProductos();
      } catch (err) {
        setError(
          err.message
        );
      }
    };

  const totalPages = Math.max(1, Math.ceil(productos.length / pageSize));
  const visibleProductos = productos.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminShell
      eyebrow="GameZone Admin / Catálogo"
      title="Gestión de productos"
      description="Crea, edita y organiza los videojuegos que aparecen en el catálogo."
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/60">Productos</p>
            <p className="mt-2 text-sm text-white/40">{productos.length} productos registrados</p>
          </div>
          <button type="button" onClick={() => { limpiarFormulario(); setShowForm(true); }} className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-[#031016] transition hover:bg-cyan-200">+ Nuevo producto</button>
        </div>

        {/* =====================
            HEADER
        ===================== */}

        {/* =====================
            FORM
        ===================== */}

        {showForm && <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl md:p-8">

          <div className="mb-7 flex items-center justify-between gap-4">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-violet-300/60">
                Producto
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {editingId
                  ? "Editar producto"
                  : "Nuevo producto"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={
                  limpiarFormulario
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="grid gap-5 md:grid-cols-2"
          >

            {/* NOMBRE */}

            <label>
              <span className="mb-2 block text-xs uppercase tracking-wider text-white/45">
                Nombre
              </span>

              <input
                name="nombre"
                value={
                  form.nombre
                }
                onChange={
                  handleChange
                }
                required
                minLength={2}
                maxLength={120}
                placeholder="Nombre del juego"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-300/40"
              />
            </label>

            {/* CATEGORÍA */}

            <label>
              <span className="mb-2 block text-xs uppercase tracking-wider text-white/45">
                Categoría
              </span>

              <select
                name="categoria_id"
                value={
                  form.categoria_id
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-3 outline-none focus:border-cyan-300/40"
              >
                {categorias.map(
                  (
                    categoria
                  ) => (
                    <option
                      key={
                        categoria.id
                      }
                      value={
                        categoria.id
                      }
                    >
                      {
                        categoria.nombre
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            {/* PRECIO */}

            <label>
              <span className="mb-2 block text-xs uppercase tracking-wider text-white/45">
                Precio
              </span>

              <input
                type="number"
                name="precio"
                value={
                  form.precio
                }
                onChange={
                  handleChange
                }
                min="0"
                required
                placeholder="Ej: 129900"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
              />
            </label>

            {/* STOCK */}

            <label>
              <span className="mb-2 block text-xs uppercase tracking-wider text-white/45">
                Stock
              </span>

              <input
                type="number"
                name="stock"
                value={
                  form.stock
                }
                onChange={
                  handleChange
                }
                min="0"
                step="1"
                required
                placeholder="Ej: 10"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
              />
            </label>

            {/* DESCRIPCIÓN */}

            <label className="md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-wider text-white/45">
                Descripción
              </span>

              <textarea
                name="descripcion"
                value={
                  form.descripcion
                }
                onChange={
                  handleChange
                }
                rows="4"
                maxLength={500}
                placeholder="Descripción del videojuego"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
              />
            </label>

            {/* =====================
                IMAGEN
            ===================== */}

            <label className="md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-wider text-white/45">
                Imagen del producto
              </span>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/2.5 p-5">

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="block w-full cursor-pointer text-sm text-white/50 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-cyan-400/10 file:px-5 file:py-3 file:font-medium file:text-cyan-300 file:transition hover:file:bg-cyan-400/20"
                />

                <p className="mt-3 text-xs text-white/30">
                  Formatos permitidos:
                  JPG, JPEG, PNG y WEBP.
                  Máximo 5 MB.
                </p>

                {/* PREVIEW NUEVA */}

                {imagePreview && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs uppercase tracking-wider text-white/35">
                      Nueva imagen
                    </p>

                    <div className="max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <img
                        src={
                          imagePreview
                        }
                        alt="Vista previa"
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* IMAGEN ACTUAL */}

                {!imagePreview &&
                  editingId &&
                  form.imagen && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs uppercase tracking-wider text-white/35">
                        Imagen actual
                      </p>

                      <div className="max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black">
                        <img
                          src={getImageUrl(
                            form.imagen
                          )}
                          alt="Imagen actual"
                          className="h-56 w-full object-cover"
                        />
                      </div>

                      <p className="mt-2 text-xs text-white/25">
                        Si no seleccionas
                        otra imagen, se
                        conservará esta.
                      </p>
                    </div>
                  )}
              </div>
            </label>

            {/* BOTÓN */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={
                  saving ||
                  uploadingImage
                }
                className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-7 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploadingImage
                  ? "Subiendo imagen..."
                  : saving
                    ? "Guardando..."
                    : editingId
                      ? "Actualizar producto"
                      : "Crear producto"}
              </button>

            </div>
          </form>

          {/* MENSAJE */}

          {mensaje && (
            <p className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
              {mensaje}
            </p>
          )}

          {/* ERROR */}

          {error && (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>}

        {/* =====================
            TABLA
        ===================== */}

        <section>

          <div className="mb-5 flex items-end justify-between">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/50">
                Catálogo
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Productos registrados
              </h2>
            </div>

            <span className="text-sm text-white/35">
              {productos.length} productos
            </span>

          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/2">

            <table className="w-full min-w-262.5 text-left text-sm">

              <thead className="bg-white/4 text-xs uppercase tracking-wider text-white/35">

                <tr>
                  <th className="p-4">
                    Imagen
                  </th>

                  <th className="p-4">
                    ID
                  </th>

                  <th className="p-4">
                    Producto
                  </th>

                  <th className="p-4">
                    Categoría
                  </th>

                  <th className="p-4">
                    Precio
                  </th>

                  <th className="p-4">
                    Stock
                  </th>

                  <th className="p-4">
                    Estado
                  </th>

                  <th className="p-4 text-right">
                    Acciones
                  </th>
                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-10 text-center text-white/40"
                    >
                      Cargando productos...
                    </td>
                  </tr>
                ) : productos.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-10 text-center text-white/40"
                    >
                      No hay productos registrados.
                    </td>
                  </tr>
                ) : (
                  visibleProductos.map(
                    (
                      producto
                    ) => (
                      <tr
                        key={
                          producto.id
                        }
                        className="border-t border-white/5 transition hover:bg-white/2.5"
                      >

                        {/* IMG */}

                        <td className="p-4">
                          <div className="h-16 w-24 overflow-hidden rounded-lg border border-white/10 bg-black">

                            {producto.imagen ? (
                              <img
                                src={getImageUrl(
                                  producto.imagen
                                )}
                                alt={
                                  producto.nombre
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-white/20">
                                Sin imagen
                              </div>
                            )}

                          </div>
                        </td>

                        <td className="p-4 text-white/35">
                          #{producto.id}
                        </td>

                        <td className="p-4">

                          <p className="font-semibold">
                            {
                              producto.nombre
                            }
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-white/30">
                            {
                              producto.descripcion
                            }
                          </p>

                        </td>

                        <td className="p-4 text-white/50">
                          {producto.categoria ??
                            "Sin categoría"}
                        </td>

                        <td className="p-4 font-medium">
                          $
                          {Number(
                            producto.precio ??
                              0
                          ).toLocaleString(
                            "es-CO"
                          )}
                        </td>

                        <td className="p-4">
                          {
                            producto.stock
                          }
                        </td>

                        <td className="p-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              producto.estado ===
                              "activo"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-red-400/10 text-red-300"
                            }`}
                          >
                            {
                              producto.estado
                            }
                          </span>

                        </td>

                        <td className="p-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                editarProducto(
                                  producto
                                )
                              }
                              className="rounded-lg bg-blue-400/10 px-3 py-2 text-xs text-blue-300 transition hover:bg-blue-400/20"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleEstado(
                                  producto
                                )
                              }
                              className="rounded-lg bg-yellow-400/10 px-3 py-2 text-xs text-yellow-300 transition hover:bg-yellow-400/20"
                            >
                              {producto.estado ===
                              "activo"
                                ? "Desactivar"
                                : "Activar"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                eliminar(
                                  producto
                                )
                              }
                              className="rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/20"
                            >
                              Eliminar
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/60">
          <span>Mostrando {visibleProductos.length} de {productos.length}</span>
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
