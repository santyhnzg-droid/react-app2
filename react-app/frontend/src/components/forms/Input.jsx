export function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  maxLength,
  autoComplete,
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

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`
            w-full
            rounded-xl
            border
            bg-white/4
            px-4
            py-3.5
            text-white
            outline-none
            backdrop-blur-xl
            transition-all
            duration-300
            placeholder:text-white/25

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
                  focus:bg-white/[0.07]
                  focus:ring-4
                  focus:ring-cyan-400/[0.07]
                `
            }
          `}
        />

        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3">
        {error ? <p className="text-xs text-red-400">{error}</p> : <span />}

        {maxLength && (
          <span className="shrink-0 text-[11px] text-white/25">
            {String(value).length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
