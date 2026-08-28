import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "../../components/admin/AdminShell";
import { getProductos, registrarVenta } from "../../services/api";

const BACKEND_URL = "http://localhost:3000";

function getImageUrl(imagen) {
  if (!imagen) return "";
  if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
  return `${BACKEND_URL}/uploads/products/${imagen}`;
}

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString("es-CO")}`;
}

export function EmpleadoDashboard() {
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      setProductos(Array.isArray(data.productos) ? data.productos : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return productos.filter((product) =>
      product.estado === "activo" &&
      (!term || `${product.nombre} ${product.categoria || ""}`.toLowerCase().includes(term))
    );
  }, [productos, search]);

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.precio) * item.cantidad,
    0
  );
  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);

  const addToCart = (product) => {
    setMessage("");
    setError("");
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: Math.min(item.cantidad + 1, product.stock) }
            : item
        );
      }
      return [...currentCart, { ...product, cantidad: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    const product = productos.find((item) => item.id === productId);
    const nextQuantity = Math.min(Math.max(Number(quantity), 0), product?.stock || 0);
    setCart((currentCart) => nextQuantity === 0
      ? currentCart.filter((item) => item.id !== productId)
      : currentCart.map((item) => item.id === productId ? { ...item, cantidad: nextQuantity } : item)
    );
  };

  const completeSale = async () => {
    if (cart.length === 0) return;
    try {
      setSaving(true);
      setError("");
      const result = await registrarVenta(
        cart.map((item) => ({ producto_id: item.id, cantidad: item.cantidad }))
      );
      setMessage(`${result.message} Venta #${result.venta.id}.`);
      setCart([]);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      eyebrow="GameZone Operaciones / Punto de venta"
      title="Caja de ventas"
      description="Encuentra productos, arma el pedido y registra la venta con el stock actualizado."
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300/55">Catálogo disponible</p>
              <h2 className="mt-2 text-2xl font-semibold">Selecciona productos</h2>
            </div>
            <label className="relative block sm:w-64">
              <span className="sr-only">Buscar producto</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto..."
                className="w-full rounded-2xl border border-white/10 bg-[#080b11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40"
              />
            </label>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#080b11]/70 p-12 text-center text-sm text-white/40">Cargando catálogo...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-[#080b11]/80 transition hover:-translate-y-1 hover:border-cyan-300/30">
                  <div className="flex h-36 items-center justify-center overflow-hidden bg-black/30">
                    {product.imagen ? <img src={getImageUrl(product.imagen)} alt={product.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <span className="text-xs text-white/20">Sin imagen</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/55">{product.categoria || "Videojuego"}</p>
                        <h3 className="mt-2 font-semibold text-white">{product.nombre}</h3>
                      </div>
                      <span className="whitespace-nowrap text-sm font-semibold text-cyan-200">{formatPrice(product.precio)}</span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className={`text-xs ${product.stock > 0 ? "text-emerald-300" : "text-red-300"}`}>{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</span>
                      <button type="button" disabled={!product.stock} onClick={() => addToCart(product)} className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-30">Agregar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-[#080b11]/90 p-5 xl:sticky xl:top-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300/60">Pedido actual</p>
              <h2 className="mt-2 text-xl font-semibold">Carrito</h2>
            </div>
            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-violet-400/10 px-2 text-sm font-semibold text-violet-200">{cartCount}</span>
          </div>

          <div className="my-5 space-y-3">
            {cart.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/30">Agrega productos para comenzar una venta.</p> : cart.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/3 p-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-white/85">{item.nombre}</span>
                  <span className="text-sm text-cyan-200">{formatPrice(Number(item.precio) * item.cantidad)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                  <span>{formatPrice(item.precio)} unidad</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="h-7 w-7 rounded-lg border border-white/10 text-white/70 hover:border-cyan-300/30">-</button>
                    <span className="w-5 text-center text-white">{item.cantidad}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="h-7 w-7 rounded-lg border border-white/10 text-white/70 hover:border-cyan-300/30">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="flex items-end justify-between">
              <span className="text-sm text-white/40">Total</span>
              <strong className="text-2xl text-white">{formatPrice(cartTotal)}</strong>
            </div>
            <button type="button" disabled={!cart.length || saving} onClick={completeSale} className="mt-5 w-full rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-30">{saving ? "Registrando..." : "Confirmar venta"}</button>
          </div>

          {message && <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">{message}</p>}
          {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
        </aside>
      </section>
    </AdminShell>
  );
}
