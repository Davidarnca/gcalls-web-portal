import logoSvg from "@/assets/logo.svg";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B1120] px-5 py-20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Central card */}
      <div className="w-full max-w-[800px] flex flex-col items-center gap-5 bg-[#151F32]/80 border border-white/5 backdrop-blur-sm rounded-2xl px-6 md:px-12 py-10 md:py-12 relative z-10">
        {/* Logo G-Calls escalado directamente */}
        <div className="flex items-center justify-center w-full py-4 overflow-visible">
          <img
            src={logoSvg}
            alt="G-Calls S.A.S."
            className="h-36 w-auto object-contain scale-150 md:scale-[2] transform-gpu origin-center transition-transform hover:scale-[2.1]"
          />
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
            En Proceso
          </span>
        </div>

        {/* Título */}
        {/* ... resto de tu código sin cambios ... */}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center leading-tight">
          <span className="text-white">Sitio Web en </span>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Mantenimiento
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base text-slate-400 text-center max-w-[560px] leading-relaxed">
          Estamos renovando nuestra plataforma para ofrecerte la mejor
          experiencia en{" "}
          <span className="font-semibold text-slate-300">
            gestión sostenible
          </span>{" "}
          y{" "}
          <span className="font-semibold text-slate-300">
            cadena de abastecimiento
          </span>
          .
        </p>

        {/* Progress bar section */}
        <div className="w-full max-w-[480px] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Renovación de plataforma
            </span>
            <span className="text-sm font-medium text-emerald-400">70%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: "70%" }}
            />
          </div>
          <div className="flex items-center justify-between">
            {["0%", "25%", "50%", "75%", "100%"].map((tick) => (
              <span key={tick} className="text-xs text-slate-500">
                {tick}
              </span>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-full py-3">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>

        {/* Contact text */}
        <p className="text-sm text-slate-500">¿Necesitas ayuda? Contáctanos</p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:contacto@gcallssas.com"
            className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">contacto@gcallssas.com</span>
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.352 0-4.544-.764-6.318-2.06l-.44-.334-2.633.883.883-2.633-.334-.44A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-10 text-sm text-slate-500 text-center relative z-10">
        © 2026 G-Calls S.A.S. · Todos los derechos reservados
      </p>
    </div>
  );
}
