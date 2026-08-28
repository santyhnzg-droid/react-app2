import whatsLogo from "../../assets/images/whats.png";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573178830925?text=Hola%20GameZone,%20necesito%20información."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="group fixed bottom-6 right-6 z-90 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500/15 text-xl text-white shadow-[0_12px_40px_rgba(16,185,129,.2)] transition hover:scale-110 hover:bg-emerald-500/25"
    >
      <span className="absolute -left-32 hidden whitespace-nowrap rounded-xl border border-white/10 bg-black/70 px-4 py-2 text-xs backdrop-blur-xl group-hover:block">
        Hablar por WhatsApp
      </span>

      <img
        src={whatsLogo}
        alt="WhatsApp"
        className="h-full w-full rounded-full object-cover"
      />
    </a>
  );
}