import { useEffect, useState } from "react";

import { AdminShell } from "../../components/admin/AdminShell";
import { actualizarEstadoPQR, getPQR, responderPQR } from "../../services/api";


export function PQRAdmin() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  async function load() { try { setItems(await getPQR()); } catch (err) { setError(err.message); } }
  useEffect(() => { load(); }, []);
  async function changeState(id, estado) { try { await actualizarEstadoPQR(id, { estado }); await load(); } catch (err) { setError(err.message); } }
  async function sendReply() { if (!selected || !reply.trim()) return; try { const result = await responderPQR(selected.id, { mensaje: reply }); setSelected(result); setReply(""); await load(); } catch (err) { setError(err.message); } }
  return <AdminShell eyebrow="GameZone / Soporte" title="Gestión PQR" description="Atiende, responde y actualiza solicitudes de clientes."><div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">{error && <div className="lg:col-span-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}<section className="rounded-3xl border border-white/10 bg-[#080b11]/80 p-5"><h2 className="text-xl font-bold">PQR recibidos</h2><div className="mt-5 space-y-3">{items.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item)} className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-300/30"><div className="flex justify-between gap-3"><strong>#{item.id} · {item.asunto}</strong><span className="text-xs text-cyan-200">{item.estado}</span></div><p className="mt-2 text-xs text-white/40">Cliente #{item.cliente_id} · {item.tipo}</p></button>)}</div></section><section className="rounded-3xl border border-white/10 bg-[#080b11]/80 p-5">{selected ? <><h2 className="text-xl font-bold">{selected.asunto}</h2><p className="mt-3 text-sm text-white/60">{selected.descripcion}</p><select value={selected.estado} onChange={(e) => changeState(selected.id, e.target.value)} className="mt-5 rounded-xl border border-white/10 bg-[#10151d] px-3 py-3 text-sm text-white"><option value="pendiente">Pendiente</option><option value="en_proceso">En proceso</option><option value="respondida">Respondida</option><option value="cerrada">Cerrada</option></select><div className="mt-5 space-y-2">{selected.respuestas?.map((item) => <div key={item.id} className="rounded-xl bg-white/[0.04] p-3 text-sm text-white/70">{item.mensaje}</div>)}</div><textarea value={reply} onChange={(e) => setReply(e.target.value)} rows="4" placeholder="Escribe una respuesta..." className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white" /><button type="button" onClick={sendReply} className="mt-3 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#031016]">Responder</button></> : <p className="py-16 text-center text-white/35">Selecciona un PQR para gestionarlo.</p>}</section></div></AdminShell>;
}

export default PQRAdmin;
