import { useState } from "react";

import { enviarMensajeChatbot } from "../../services/api";


export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hola, soy el asistente de GameZone. ¿En qué puedo ayudarte?" },
  ]);
  const [loading, setLoading] = useState(false);

  async function send(event) {
    event.preventDefault();
    if (!message.trim() || loading) return;

    const text = message.trim();
    setMessage("");
    setMessages((current) => [...current, { from: "user", text }]);
    setLoading(true);

    try {
      const result = await enviarMensajeChatbot({
        mensaje: text,
        conversacion_id: conversationId || undefined,
      });
      setConversationId(result.conversacion_id);
      setMessages((current) => [...current, { from: "bot", text: result.respuesta }]);
    } catch (err) {
      setMessages((current) => [...current, {
        from: "bot",
        text: err.status === 401
          ? "Inicia sesión para guardar la conversación."
          : err.message,
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        type="button"
        aria-label="Abrir chatbot de GameZone"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-400 text-2xl text-[#12071e] shadow-2xl shadow-violet-500/30 transition hover:scale-105"
      >
        ✦
      </button>

      {open && (
        <section className="absolute bottom-16 right-0 flex h-[460px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-violet-300/20 bg-[#080b11]/95 text-white shadow-2xl backdrop-blur-xl">
          <header className="border-b border-white/10 bg-violet-400/10 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/70">GameZone Assistant</p>
            <h2 className="mt-1 font-bold">Soporte rápido</h2>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div key={`${item.from}-${index}`} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${item.from === "user" ? "ml-auto bg-cyan-300 text-[#031016]" : "bg-white/[0.07] text-white/75"}`}>
                {item.text}
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe tu pregunta..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none" />
            <button type="submit" disabled={loading} className="rounded-xl bg-violet-300 px-3 text-sm font-bold text-[#12071e] disabled:opacity-50">
              {loading ? "..." : "Enviar"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
