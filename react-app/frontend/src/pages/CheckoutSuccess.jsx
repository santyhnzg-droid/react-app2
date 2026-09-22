import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { consultarStripeCheckout, descargarFacturaPdf } from "../services/api";


export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [estado, setEstado] = useState("PENDING");
  const [error, setError] = useState("");
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setEstado("FAILED");
      setError("No se recibió la sesión de pago.");
      return undefined;
    }

    let activo = true;
    let intentos = 0;
    let timer;
    const consultar = async () => {
      try {
        const result = await consultarStripeCheckout(sessionId);
        if (!activo) return;
        setEstado(result.estado);
        if (result.factura_id) {
          setFactura({ id: result.factura_id, numero: result.numero_factura });
        }
        if (result.estado === "APPROVED") {
          setError("");
        } else if (result.estado === "FAILED" && result.mensaje_error) {
          setError(result.mensaje_error);
        }
        if (result.estado === "PENDING" && intentos < 10) {
          intentos += 1;
          timer = window.setTimeout(consultar, 3000);
        } else if (result.estado === "PENDING") {
          setError("La confirmación está tardando más de lo esperado. Revisa el estado nuevamente en unos minutos.");
        }
      } catch (requestError) {
        if (activo) setError(requestError.message || "No fue posible consultar el pago.");
      }
    };
    consultar();
    return () => {
      activo = false;
      window.clearTimeout(timer);
    };
  }, [sessionId]);

  const messages = {
    PENDING: "Estamos confirmando tu pago...",
    APPROVED: "Pago aprobado correctamente",
    FAILED: "El pago no pudo ser confirmado",
    CANCELLED: "El pago fue cancelado",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030509] px-6 text-center text-white">
      <section className="w-full max-w-xl rounded-3xl border border-cyan-300/15 bg-white/[0.04] p-10 shadow-2xl shadow-cyan-950/30">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">GameZone</p>
        <h1 className="mt-6 text-3xl font-semibold">{messages[estado]}</h1>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {estado === "APPROVED" && factura && (
          <button
            type="button"
            onClick={() => descargarFacturaPdf(factura.id, factura.numero)}
            className="mt-8 inline-block rounded-xl border border-cyan-300/40 px-6 py-3 text-sm font-bold text-cyan-200 hover:bg-cyan-300/10"
          >
            Descargar factura PDF
          </button>
        )}
        <Link to="/productos" className="mt-8 inline-block rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#031016]">Volver al catálogo</Link>
      </section>
    </main>
  );
}
