import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ModuleDef, ModuleStat } from '../modules'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  def: ModuleDef
  stat?: ModuleStat
  tone: 'blue' | 'red'
}

function statusMeta(stat?: ModuleStat) {
  if (!stat?.ok) {
    return { label: 'No disponible', className: 'bg-black/5 text-[#5c6472]' }
  }
  if (stat.count === null) {
    return { label: 'Sin datos', className: 'bg-black/5 text-[#5c6472]' }
  }
  if (stat.count === 0) {
    return { label: 'Vacío', className: 'bg-[#003399]/10 text-[#003399]' }
  }
  return { label: 'Activo', className: 'bg-[#003399]/10 text-[#003399]' }
}

export function ModuleCard({ def, stat, tone }: ModuleCardProps) {
  const Icon = def.icon
  const status = statusMeta(stat)
  const count =
    stat?.ok && stat.count !== null ? stat.count.toLocaleString('es-DO') : '—'
  const accent = tone === 'red' ? 'bg-[#DD3333]' : 'bg-[#003399]'

  return (
    <Link
      href={def.href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#003399]/10 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399]"
    >
      <span className={cn('h-1.5', accent)} aria-hidden />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('flex size-11 items-center justify-center rounded-xl text-white', accent)}>
            <Icon className="size-5" />
          </div>
          <ArrowRight className="size-4 text-[#5c6472] transition group-hover:translate-x-1 group-hover:text-[#003399]" />
        </div>

        <div className="mt-4">
          <p className="text-3xl font-semibold tabular-nums text-[#23232C]">{count}</p>
          <p className="mt-1 text-sm font-semibold text-[#23232C]">{def.label}</p>
          <p className="text-xs text-[#5c6472]">{def.hint}</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#003399]/10 pt-3">
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', status.className)}>
            {status.label}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5c6472] transition group-hover:text-[#DD3333]">
            Abrir
          </span>
        </div>
      </div>
    </Link>
  )
}
