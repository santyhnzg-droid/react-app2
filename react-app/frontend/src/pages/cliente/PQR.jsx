import { useEffect, useState } from "react";

import { Navbar } from "../../components/Navbar/Navbar";
import { crearPQR, getPQR, getPQRDetalle } from "../../services/api";


export function PQRCliente() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ tipo: "peticion", asunto: "", descripcion: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try { setItems(await getPQR()); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);
  async function submit(event) {
    event.preventDefault(); setError(""); setMessage("");
    try { await crearPQR(form); setForm({ tipo: "peticion", asunto: "", descripcion: "" }); setMessage("PQR creado correctamente."); await load(); } catch (err) { setError(err.message); }
  }
  async function showDetail(id) {
    try { setSelected(await getPQRDetalle(id)); } catch (err) { setError(err.message); }
  }

  return <><Navbar /><main className="min-h-screen bg-[#030509] px-5 pb-16 pt-32 text-white sm:px-8 lg:px-16"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300/65">GameZone / Soporte</p><h1 className="mt-3 text-4xl font-black">Mis PQR</h1><p className="mt-3 text-white/45">Crea solicitudes y consulta sus respuestas y estado.</p>{error && <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}{message && <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div>}<div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.3fr]"><form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><h2 className="text-xl font-bold">Crear PQR</h2><label className="mt-5 block text-xs text-white/45">Tipo<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white"><option value="peticion">Petición</option><option value="queja">Queja</option><option value="reclamo">Reclamo</option><option value="sugerencia">Sugerencia</option><option value="otro">Otro</option></select></label><label className="mt-4 block text-xs text-white/45">Asunto<input required minLength="3" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label><label className="mt-4 block text-xs text-white/45">Descripción<textarea required minLength="5" rows="6" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white" /></label><button className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#031016]">Enviar PQR</button></form><div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6"><h2 className="text-xl font-bold">Solicitudes</h2><div className="mt-5 space-y-3">{items.map((item) => <button type="button" key={item.id} onClick={() => showDetail(item.id)} className="block w-full rounded-2xl border border-white/10 bg-black/10 p-4 text-left hover:border-cyan-300/30"><div className="flex justify-between gap-3"><strong>#{item.id} · {item.asunto}</strong><span className="text-xs text-cyan-200">{item.estado}</span></div><p className="mt-2 text-xs text-white/40">{item.tipo} · {item.respuestas?.length || 0} respuestas</p></button>)}{!items.length && <p className="py-10 text-center text-white/35">Todavía no tienes PQR.</p>}</div>{selected && <div className="mt-5 rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-5"><div className="flex justify-between"><h3 className="font-bold">Detalle #{selected.id}</h3><button type="button" onClick={() => setSelected(null)} className="text-xs text-white/45">Cerrar</button></div><p className="mt-3 text-sm text-white/70">{selected.descripcion}</p><div className="mt-4 space-y-2">{selected.respuestas?.map((reply) => <div key={reply.id} className="rounded-xl bg-black/15 p-3 text-sm text-white/70">{reply.mensaje}</div>)}</div></div>}</div></div></div></main></>;
}

export default PQRCliente;
