export function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group
        relative
        inline-flex
        w-full
        items-center
        justify-center
        gap-3
        overflow-hidden
        rounded-xl
        border
        border-white/15
        bg-white/7
        px-6
        py-3.5
        text-sm
        font-bold
        uppercase
        tracking-[0.08em]
        text-white
        shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_35px_rgba(0,0,0,0.28)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-cyan-300/40
        hover:bg-white/12
        hover:shadow-[0_0_28px_rgba(34,211,238,0.10)]
        active:translate-y-0
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${className}
      `}
    >
      <span className="pointer-events-none absolute left-[12%] top-0 h-px w-[76%] bg-linear-to-r from-transparent via-cyan-300/80 to-violet-400/70" />

      <span className="relative z-10">{children}</span>

      <span className="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}
