import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Cart } from "../components/Cart/Cart";
import { Footer } from "../components/Footer/Footer";
import { Navbar } from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { crearStripeCheckoutCarrito, getServicios } from "../services/api";

export function Servicios() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getServicios()
      .then((data) => setServicios((data.servicios || []).filter((item) => item.estado === "activo")))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function agregarAlCarrito(servicio) {
    setCarrito((actual) => {
      const existing = actual.find((item) => item.id === servicio.id);
      if (existing) return actual.map((item) => item.id === servicio.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      return [...actual, { ...servicio, tipo: "servicio", cantidad: 1 }];
    });
  }

  function cambiarCantidad(id, cantidad) {
    const next = Math.max(Number(cantidad), 0);
    setCarrito((actual) => next === 0 ? actual.filter((item) => item.id !== id) : actual.map((item) => item.id === id ? { ...item, cantidad: next } : item));
  }

  async function confirmarCompra() {
    if (!usuario) {
      navigate("/login");
      return;
    }
    if (!carrito.length) return;
    try {
      setComprando(true);
      setError("");
      const data = await crearStripeCheckoutCarrito(carrito.map((item) => ({ tipo: "servicio", servicio_id: item.id, cantidad: item.cantidad })));
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.message);
      setComprando(false);
    }
  }

  const total = carrito.reduce((sum, item) => sum + Number(item.precio) * item.cantidad, 0);

  return (
    <div className="min-h-screen bg-[#030509] text-white">
      <header className="relative border-b border-white/5 bg-[#05070b]"><Navbar /><div className="mx-auto max-w-7xl px-6 pb-20 pt-40"><p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-300/70">GameZone Services</p><h1 className="mt-4 text-5xl font-semibold md:text-7xl">Servicios para ti</h1><p className="mt-5 max-w-2xl text-white/40">Adquiere soporte, asistencia y servicios especializados directamente desde GameZone.</p></div></header>
      <main className="mx-auto max-w-7xl px-6 py-20">
        {error && <div className="mb-8 rounded-xl border border-rose-300/20 bg-rose-400/10 px-5 py-4 text-rose-200">{error}</div>}
        {loading && <div className="py-20 text-center text-white/40">Cargando servicios...</div>}
        {!loading && !servicios.length && <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center text-white/40">No hay servicios activos en este momento.</div>}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio) => <article key={servicio.id} className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:-translate-y-1 hover:border-violet-300/30 hover:bg-violet-300/[0.05]"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/15 text-2xl text-violet-200">✦</span><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-violet-300/60">Servicio disponible</p><h2 className="mt-3 text-2xl font-black">{servicio.nombre}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-white/45">{servicio.descripcion || "Servicio especializado de GameZone."}</p><div className="mt-7 flex items-center justify-between gap-4"><strong className="text-xl text-cyan-200">${Number(servicio.precio).toLocaleString("es-CO")}</strong><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Activo</span></div><button type="button" onClick={() => agregarAlCarrito(servicio)} className="mt-6 w-full rounded-xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-sm font-bold text-violet-100 transition hover:bg-violet-300/20">Agregar al carrito</button></article>)}
        </section>
        <Cart items={carrito} total={total} loading={comprando} authenticated={Boolean(usuario)} message={error} onChangeQuantity={cambiarCantidad} onCheckout={confirmarCompra} />
      </main>
      <Footer />
    </div>
  );
}

export default Servicios;
