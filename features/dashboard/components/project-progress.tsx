import type { ElementType } from 'react'
import { CheckCircle2, CircleDashed, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type MilestoneStatus = 'done' | 'progress' | 'pending'

interface Milestone {
  label: string
  status: MilestoneStatus
}

const MILESTONES: Milestone[] = [
  { label: 'M1 · Plataforma y multi-moneda', status: 'done' },
  { label: 'M2 · Maestros (RNC/cédula)', status: 'done' },
  { label: 'M3 · Landed cost + cotizaciones + PDF', status: 'done' },
  { label: 'M4 · CBM · tracking · demurrage', status: 'done' },
  { label: 'Fase 2 · Pedidos · CxC · CxP', status: 'done' },
  { label: 'DGII / e-CF · inventario · BI', status: 'progress' },
]

const STATUS_META: Record<
  MilestoneStatus,
  { label: string; icon: ElementType; className: string }
> = {
  done: { label: 'Completado', icon: CheckCircle2, className: 'text-success' },
  progress: { label: 'En curso', icon: Clock, className: 'text-warning' },
  pending: { label: 'Pendiente', icon: CircleDashed, className: 'text-muted-foreground' },
}

export function ProjectProgress() {
  const done = MILESTONES.filter((m) => m.status === 'done').length
  const progress = MILESTONES.filter((m) => m.status === 'progress').length

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Hoja de ruta</h2>
          <p className="text-xs text-muted-foreground">
            Estado del blueprint ImportCore RD.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {done} completados · {progress} en curso
        </p>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {MILESTONES.map((m) => {
          const meta = STATUS_META[m.status]
          const Icon = meta.icon
          return (
            <li
              key={m.label}
              className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5"
            >
              <Icon className={cn('size-4 shrink-0', meta.className)} />
              <span className="min-w-0 flex-1 truncate text-sm">{m.label}</span>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-semibold uppercase tracking-wide',
                  meta.className,
                )}
              >
                {meta.label}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
