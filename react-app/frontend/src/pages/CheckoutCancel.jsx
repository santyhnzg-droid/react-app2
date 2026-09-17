import { Link } from "react-router-dom";


export function CheckoutCancel() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030509] px-6 text-center text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">GameZone</p>
        <h1 className="mt-6 text-3xl font-semibold">Pago cancelado</h1>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/productos" className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#031016]">Volver al catálogo</Link>
          <Link to="/" className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold">Ir al inicio</Link>
        </div>
      </section>
    </main>
  );
}
