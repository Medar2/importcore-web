import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ModuleDef, ModuleStat } from '../modules'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  def: ModuleDef
  stat?: ModuleStat
}

function statusMeta(stat?: ModuleStat) {
  if (!stat?.ok) {
    return { label: 'No disponible', className: 'bg-muted text-muted-foreground' }
  }
  if (stat.count === null) {
    return { label: 'Sin datos', className: 'bg-muted text-muted-foreground' }
  }
  return { label: 'Disponible', className: 'bg-success/10 text-success' }
}

export function ModuleCard({ def, stat }: ModuleCardProps) {
  const Icon = def.icon
  const status = statusMeta(stat)
  const count =
    stat?.ok && stat.count !== null ? stat.count.toLocaleString('es-DO') : '—'

  return (
    <Link
      href={def.href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tabular-nums">{count}</p>
        <p className="mt-1 text-sm font-semibold">{def.label}</p>
        <p className="text-xs text-muted-foreground">{def.hint}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            status.className,
          )}
        >
          {status.label}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground transition group-hover:text-primary">
          Abrir
        </span>
      </div>
    </Link>
  )
}
