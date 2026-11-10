import Link from 'next/link'
import { Anchor, Calculator, FileText, Ship } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-primary text-primary-foreground">
      {/* Banda blanca + roja tipo bandera dominicana */}
      <div className="flex h-2.5 w-full">
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#ce1126]" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10">
          <Anchor className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ImportCore RD</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Todo Import RD — Importación por encargo, China → República Dominicana
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-3 gap-2 text-xs">
          {[
            { icon: Calculator, label: 'Landed Cost' },
            { icon: FileText, label: 'Cotizaciones PDF' },
            { icon: Ship, label: 'Contenedores' },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-2 py-3"
            >
              <f.icon className="size-4" />
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <p className="max-w-md text-xs text-primary-foreground/70">
          Cotizaciones, CBM/contenedores, anticipos, despacho con candado de saldo
          y cumplimiento fiscal DGII — todo en una plataforma móvil.
        </p>

        <Link
          href="/login"
          className="mt-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg transition hover:bg-white/90"
        >
          Entrar
        </Link>
        <p className="text-[10px] text-primary-foreground/50">
          Entorno de desarrollo — Fases 1 y 2 en construcción
        </p>
      </div>
    </main>
  )
}
