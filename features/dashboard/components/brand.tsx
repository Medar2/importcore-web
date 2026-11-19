export const BRAND = {
  blue: '#003399',
  red: '#DD3333',
  ink: '#23232C',
  muted: '#5c6472',
  canvas: '#f3f5f8',
} as const

/** Cruz blanca sobre los cuatro cuartos, como la bandera dominicana. */
export function FlagMark({ className = 'size-9' }: { className?: string }) {
  return (
    <span
      className={`relative grid grid-cols-2 grid-rows-2 shrink-0 overflow-hidden rounded-[3px] shadow-sm ${className}`}
      aria-hidden
    >
      <span className="bg-[#003399]" />
      <span className="bg-[#DD3333]" />
      <span className="bg-[#DD3333]" />
      <span className="bg-[#003399]" />
      <span className="absolute inset-y-0 left-1/2 w-[18%] -translate-x-1/2 bg-white" />
      <span className="absolute inset-x-0 top-1/2 h-[18%] -translate-y-1/2 bg-white" />
    </span>
  )
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <p className={`text-[1.15rem] font-semibold leading-none tracking-tight ${light ? 'text-white' : ''}`}>
      <span className={light ? 'text-white' : 'text-[#DD3333]'}>Todo</span>
      <span className={light ? 'text-white' : 'text-[#003399]'}>Import</span>
      <span className={`ml-1 text-[0.72em] font-bold tracking-wide ${light ? 'text-white/90' : 'text-[#003399]'}`}>
        RD
      </span>
    </p>
  )
}

export function SectionHeading({
  kicker,
  title,
  hint,
}: {
  kicker: string
  title: string
  hint: string
}) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#DD3333]">{kicker}</p>
      <h2 className="mt-1 text-lg font-semibold uppercase tracking-wide text-[#23232C]">{title}</h2>
      <p className="mt-0.5 text-sm text-[#5c6472]">{hint}</p>
    </div>
  )
}
