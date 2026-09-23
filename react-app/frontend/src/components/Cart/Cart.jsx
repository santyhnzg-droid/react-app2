import { useEffect, useState } from "react";


export function Cart({ items, total, loading = false, authenticated = true, message = "", onChangeQuantity, onCheckout }) {
  const [open, setOpen] = useState(false);
  const totalUnits = items.reduce((sum, item) => sum + item.cantidad, 0);

  useEffect(() => {
    document.documentElement.dataset.cartOpen = open ? "true" : "false";
    return () => {
      document.documentElement.dataset.cartOpen = "false";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeWithEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  return (
    <>
      <button type="button" aria-label="Abrir carrito" onClick={() => setOpen(true)} className="fixed right-6 top-28 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/30 bg-[#0b1118]/95 text-cyan-100 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/70 hover:bg-[#101d28]">
        <span className="text-2xl">🛒</span>
        {totalUnits > 0 && <span className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-cyan-300 px-1.5 text-xs font-black text-[#031016]">{totalUnits}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-black/65 backdrop-blur-sm" />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#080c12] p-6 shadow-2xl shadow-black/60 sm:p-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-300/70">Tu pedido</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Carrito</h2>
                <p className="mt-2 text-sm text-white/40">Revisa tus productos antes de pagar.</p>
              </div>
              <button type="button" aria-label="Cerrar carrito" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-xl text-white/60 transition hover:border-white/25 hover:text-white">×</button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-6">
              {items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
                  <div className="text-4xl opacity-70">🛍️</div>
                  <p className="mt-5 text-sm text-white/45">Agrega un juego para comenzar tu compra.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <div className="flex justify-between gap-4">
                        <div><p className="font-medium text-white">{item.nombre}</p><p className="mt-1 text-xs text-white/40">${Number(item.precio).toLocaleString("es-CO")} por unidad</p></div>
                        <p className="font-semibold text-cyan-200">${Number(item.precio * item.cantidad).toLocaleString("es-CO")}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-white/45">
                        <span>Cantidad</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => onChangeQuantity(item.id, item.cantidad - 1)} className="h-8 w-8 rounded-lg border border-white/10 text-lg text-white/70 transition hover:border-cyan-300/40 hover:text-white">-</button>
                          <span className="w-6 text-center text-white">{item.cantidad}</span>
                          <button type="button" onClick={() => onChangeQuantity(item.id, item.cantidad + 1)} className="h-8 w-8 rounded-lg border border-white/10 text-lg text-white/70 transition hover:border-cyan-300/40 hover:text-white">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex items-end justify-between"><span className="text-sm text-white/45">Total</span><strong className="text-3xl text-white">${total.toLocaleString("es-CO")}</strong></div>
              <button type="button" disabled={items.length === 0 || loading} onClick={onCheckout} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-bold text-[#031016] transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-35">{loading ? "Redirigiendo a Stripe..." : "Comprar ahora"}</button>
              {!authenticated && <p className="mt-3 text-center text-xs text-white/40">Debes iniciar sesión para finalizar la compra.</p>}
              {message && <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">{message}</p>}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
