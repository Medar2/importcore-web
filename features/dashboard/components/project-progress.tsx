import type { ElementType } from 'react'
import { CheckCircle2, CircleDashed, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from './brand'

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
  done: { label: 'Listo', icon: CheckCircle2, className: 'text-[#003399]' },
  progress: { label: 'En curso', icon: Clock, className: 'text-[#DD3333]' },
  pending: { label: 'Pendiente', icon: CircleDashed, className: 'text-[#5c6472]' },
}

export function ProjectProgress() {
  const done = MILESTONES.filter((m) => m.status === 'done').length
  const progress = MILESTONES.filter((m) => m.status === 'progress').length
  const ratio = (done + progress * 0.45) / MILESTONES.length

  return (
    <section className="mt-8">
      <SectionHeading
        kicker="Producto"
        title="Hoja de ruta"
        hint="Lo que ya opera y lo que sigue en el blueprint."
      />
      <div className="rounded-2xl border border-[#003399]/10 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-[#5c6472]">
          <span>
            {done} listos · {progress} en curso
          </span>
          <span className="tabular-nums text-[#003399]">{Math.round(ratio * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#003399]/10">
          <div className="flex h-full" style={{ width: `${ratio * 100}%` }}>
            <span className="h-full flex-1 bg-[#003399]" />
            <span className="h-full w-2 bg-[#DD3333]" />
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {MILESTONES.map((m) => {
            const meta = STATUS_META[m.status]
            const Icon = meta.icon
            return (
              <li
                key={m.label}
                className="flex items-center gap-2.5 rounded-xl bg-[#f3f5f8] px-3 py-2.5"
              >
                <Icon className={cn('size-4 shrink-0', meta.className)} />
                <span className="min-w-0 flex-1 truncate text-sm text-[#23232C]">{m.label}</span>
                <span className={cn('shrink-0 text-[10px] font-semibold uppercase tracking-wide', meta.className)}>
                  {meta.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
