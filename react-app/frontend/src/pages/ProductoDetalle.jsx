import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Footer } from "../components/Footer/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { crearStripeCheckout, getProducto } from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png";

const BACKEND_URL = "http://127.0.0.1:8000";

function getImageUrl(imagen) {
  if (!imagen) return logo;
  if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
  return `${BACKEND_URL}/uploads/products/${imagen}`;
}

export function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { autenticado } = useAuth();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function comprarAhora() {
    if (!autenticado) {
      navigate("/login");
      return;
    }
    if (!producto || producto.estado !== "activo" || producto.stock < 1) return;
    try {
      setCheckoutLoading(true);
      setCheckoutError("");
      const data = await crearStripeCheckout(producto.id, 1);
      window.location.href = data.checkout_url;
    } catch (requestError) {
      setCheckoutError(requestError.message || "No fue posible iniciar el pago.");
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProducto(id);
        setProducto(data.producto);
      } catch (requestError) {
        setError(requestError.message || "No fue posible cargar el videojuego.");
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#030509] pt-40 text-center text-white/50">Cargando información...</div>;
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[#030509] px-6 pt-40 text-center text-white">
        <Navbar />
        <p className="text-red-300">{error || "Videojuego no encontrado."}</p>
        <Link to="/" className="mt-8 inline-block text-sm text-cyan-300 hover:text-cyan-200">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#030509] text-white">
      <header className="relative border-b border-white/5 bg-[#05070b]">
        <Navbar />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-36 sm:pb-24 sm:pt-44">
          <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
          <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

          <Link to="/" className="relative z-10 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300/70 transition hover:text-cyan-200">
            ← Volver a destacados
          </Link>

          <div className="relative z-10 mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/40">
              <img
                src={getImageUrl(producto.imagen)}
                alt={producto.nombre}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = logo;
                }}
                className="aspect-4/3 h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/65">{producto.categoria || "Videojuego"}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{producto.nombre}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
                {producto.descripcion || "Descubre una nueva aventura disponible en GameZone."}
              </p>

              <div className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-5 border-y border-white/10 py-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Precio</p>
                  <strong className="mt-2 block text-3xl text-white">${Number(producto.precio || 0).toLocaleString("es-CO")}</strong>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Disponibilidad</p>
                  <span className={`mt-3 block text-sm font-medium ${producto.stock > 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {producto.stock > 0 ? `${producto.stock} unidades disponibles` : "Agotado"}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={comprarAhora}
                  disabled={checkoutLoading || producto.estado !== "activo" || producto.stock < 1}
                  className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#031016] transition hover:-translate-y-1 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checkoutLoading ? "Redirigiendo..." : "Comprar ahora"}
                </button>
                <Link to="/productos" className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-1 hover:bg-cyan-300/20">
                  Ver catálogo
                </Link>
                <Link to="/contacto" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/75 transition hover:-translate-y-1 hover:border-white/30 hover:text-white">
                  Consultar disponibilidad
                </Link>
              </div>
              {producto.estado !== "activo" && <p className="mt-4 text-sm text-amber-300">Este producto no está disponible actualmente.</p>}
              {checkoutError && <p className="mt-4 text-sm text-red-300">{checkoutError}</p>}
            </div>
          </div>
        </div>
      </header>
      <Footer />
    </div>
  );
}

