export function Select({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/60"
      >
        {label}

        {required && <span className="ml-1 text-cyan-300">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full
          rounded-xl
          border
          bg-[#0d1118]
          px-4
          py-3.5
          text-white
          outline-none
          transition-all
          duration-300

          ${
            error
              ? `
                border-red-400/60
                focus:border-red-400
                focus:ring-4
                focus:ring-red-500/10
              `
              : `
                border-white/10
                hover:border-white/20
                focus:border-cyan-300/50
                focus:ring-4
                focus:ring-cyan-400/[0.07]
              `
          }
        `}
      >
        <option value="">Selecciona una opción</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="mt-1.5 min-h-5">
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
