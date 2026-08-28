import {
  useEffect,
  useState,
} from "react";

import {
  Navbar,
} from "../components/Navbar/Navbar";

import {
  Footer,
} from "../components/Footer/Footer";

import {
  getProductos,
  registrarVenta,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

import logo from "../assets/images/logo.png";

const BACKEND_URL =
  "http://localhost:3000";

function getImageUrl(
  imagen
) {
  if (!imagen) {
    return logo;
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

export function Productos() {
  const { usuario } = useAuth();
  const [
    productos,
    setProductos,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [carrito, setCarrito] = useState([]);
  const [comprando, setComprando] = useState(false);
  const [mensajeCompra, setMensajeCompra] = useState("");

  const agregarAlCarrito = (producto) => {
    setMensajeCompra("");
    setCarrito((actual) => {
      const existente = actual.find(
        (item) => item.id === producto.id
      );

      if (existente) {
        return actual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: Math.min(
                  item.cantidad + 1,
                  producto.stock
                ),
              }
            : item
        );
      }

      return [
        ...actual,
        { ...producto, cantidad: 1 },
      ];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    const producto = productos.find(
      (item) => item.id === id
    );

    const nuevaCantidad = Math.min(
      Math.max(Number(cantidad), 0),
      producto?.stock || 0
    );

    setCarrito((actual) =>
      nuevaCantidad === 0
        ? actual.filter((item) => item.id !== id)
        : actual.map((item) =>
            item.id === id
              ? { ...item, cantidad: nuevaCantidad }
              : item
          )
    );
  };

  const totalCarrito = carrito.reduce(
    (total, item) =>
      total + Number(item.precio) * item.cantidad,
    0
  );

  const confirmarCompra = async () => {
    if (!usuario) {
      setMensajeCompra("Inicia sesión para comprar productos.");
      return;
    }

    if (carrito.length === 0) return;

    try {
      setComprando(true);
      setError("");

      const data = await registrarVenta(
        carrito.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
        }))
      );

      setMensajeCompra(
        `${data.message} Número de compra: #${data.venta.id}.`
      );
      setCarrito([]);

      const refreshed = await getProductos();
      setProductos(
        Array.isArray(refreshed.productos)
          ? refreshed.productos.filter(
              (producto) => producto.estado === "activo"
            )
          : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setComprando(false);
    }
  };

  useEffect(() => {
    const cargar =
      async () => {
        try {
          setError("");

          const data =
            await getProductos();

          const activos =
            Array.isArray(
              data.productos
            )
              ? data.productos.filter(
                  (
                    producto
                  ) =>
                    producto.estado ===
                    "activo"
                )
              : [];

          setProductos(
            activos
          );
        } catch (err) {
          setError(
            err.message
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-[#030509] text-white">

      {/* HEADER */}

      <header className="relative border-b border-white/5 bg-[#05070b]">

        <Navbar />

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-40">

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/60">
            GameZone Library
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Catálogo de juegos
          </h1>

          <p className="mt-5 max-w-2xl text-white/40">
            Explora los videojuegos
            disponibles actualmente
            en GameZone.
          </p>

        </div>
      </header>

      {/* PRODUCTOS */}

      <main className="mx-auto max-w-7xl px-6 py-20">

        {loading && (
          <div className="py-20 text-center text-white/40">
            Cargando videojuegos...
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-red-300">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          productos.length ===
            0 && (
            <div className="py-20 text-center text-white/30">
              No hay videojuegos
              disponibles actualmente.
            </div>
          )}

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {productos.map(
            (
              producto
            ) => (
              <article
                key={
                  producto.id
                }
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/5"
              >

                {/* IMAGEN */}

                <div className="relative h-72 overflow-hidden bg-black">

                  <img
                    src={getImageUrl(
                      producto.imagen
                    )}
                    alt={
                      producto.nombre
                    }
                    onError={(
                      event
                    ) => {
                      event.currentTarget.onerror =
                        null;

                      event.currentTarget.src =
                        logo;
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#07090d] to-transparent" />

                </div>

                {/* CONTENT */}

                <div className="p-6">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-xs uppercase tracking-widest text-cyan-300/60">
                      {producto.categoria ??
                        "Videojuego"}
                    </span>

                    <span className="text-xs text-white/30">
                      Stock:{" "}
                      {
                        producto.stock
                      }
                    </span>

                  </div>

                  <h2 className="mt-3 text-2xl font-semibold">
                    {
                      producto.nombre
                    }
                  </h2>

                  <p className="mt-3 min-h-14 text-sm leading-6 text-white/40">
                    {producto.descripcion ||
                      "Videojuego disponible en GameZone."}
                  </p>

                  <div className="mt-7 flex items-center justify-between gap-4">

                    <strong className="text-xl">
                      $
                      {Number(
                        producto.precio
                      ).toLocaleString(
                        "es-CO"
                      )}
                    </strong>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        producto.stock >
                        0
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-red-400/10 text-red-300"
                      }`}
                    >
                      {producto.stock >
                      0
                        ? "Disponible"
                        : "Agotado"}
                    </span>

                  </div>

                  <button
                    type="button"
                    disabled={!producto.stock}
                    onClick={() => agregarAlCarrito(producto)}
                    className="mt-6 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {producto.stock > 0
                      ? "Agregar al carrito"
                      : "Agotado"}
                  </button>

                </div>

              </article>
            )
          )}

        </section>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.035] p-6 xl:sticky xl:top-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300/60">
                Tu pedido
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Carrito</h2>
            </div>
            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-violet-400/10 px-2 text-sm text-violet-200">
              {carrito.reduce((total, item) => total + item.cantidad, 0)}
            </span>
          </div>

          <div className="my-5 space-y-3">
            {carrito.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">
                Agrega un juego para comenzar tu compra.
              </p>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/3 p-3"
                >
                  <div className="flex justify-between gap-3">
                    <span className="text-sm text-white/85">
                      {item.nombre}
                    </span>
                    <span className="text-sm text-cyan-200">
                      $
                      {Number(item.precio * item.cantidad).toLocaleString(
                        "es-CO"
                      )}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                    <span>Unidades</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        className="h-7 w-7 rounded-lg border border-white/10 text-white/70 hover:border-cyan-300/30"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-white">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        className="h-7 w-7 rounded-lg border border-white/10 text-white/70 hover:border-cyan-300/30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="flex items-end justify-between">
              <span className="text-sm text-white/40">Total</span>
              <strong className="text-2xl">
                ${totalCarrito.toLocaleString("es-CO")}
              </strong>
            </div>

            <button
              type="button"
              disabled={carrito.length === 0 || comprando}
              onClick={confirmarCompra}
              className="mt-5 w-full rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {comprando ? "Procesando compra..." : "Comprar ahora"}
            </button>

            {!usuario && (
              <p className="mt-3 text-center text-xs text-white/35">
                Debes iniciar sesión para finalizar la compra.
              </p>
            )}

            {mensajeCompra && (
              <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">
                {mensajeCompra}
              </p>
            )}
          </div>
        </aside>
        </div>

      </main>

      <Footer />

    </div>
  );
}