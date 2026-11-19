import type { ReactNode } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardSummaryProps {
  loading: boolean
  totalRecords: number
  modulesWithData: number
  modulesTotal: number
  failedCount: number
  updatedLabel: string
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint: string
}) {
  return (
    <div className="rounded-xl bg-white px-3 py-3 text-[#23232C] shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#DD3333]">
        {label}
      </p>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-[#003399]">{value}</div>
      <p className="mt-0.5 text-xs text-[#5c6472]">{hint}</p>
    </div>
  )
}

export function DashboardSummary({
  loading,
  totalRecords,
  modulesWithData,
  modulesTotal,
  failedCount,
  updatedLabel,
}: DashboardSummaryProps) {
  const status = loading
    ? 'checking'
    : failedCount === 0
      ? 'ok'
      : failedCount === modulesTotal
        ? 'down'
        : 'degraded'

  const statusMeta = {
    checking: { label: 'Verificando', hint: 'Consultando la operación' },
    ok: { label: 'Operativa', hint: 'Todos los módulos respondieron' },
    degraded: { label: 'Parcial', hint: `${failedCount} módulo(s) sin respuesta` },
    down: { label: 'Sin conexión', hint: 'La API no está disponible' },
  }[status]

  return (
    <section className="relative overflow-hidden bg-[#003399] text-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[#DD3333]" aria-hidden />
      <div
        className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-[#DD3333]/25"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Panel de operación
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Resumen general
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
              Compras en China, contenedores y entrega en República Dominicana. Estado de ImportCore en este momento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/quotes/new"
              className="flex h-11 items-center gap-1.5 rounded-lg bg-[#DD3333] px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              <Plus className="size-4" /> Nueva cotización
            </Link>
            <Link
              href="/orders"
              className="flex h-11 items-center gap-1.5 rounded-lg border border-white/70 bg-transparent px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#003399]"
            >
              <ClipboardList className="size-4" /> Pedidos
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Registros"
            value={loading ? '…' : totalRecords.toLocaleString('es-DO')}
            hint="Suma de los módulos"
          />
          <Stat
            label="Con datos"
            value={loading ? '…' : `${modulesWithData}/${modulesTotal}`}
            hint="Módulos con registros"
          />
          <Stat
            label="Estado"
            value={
              <span className="inline-flex items-center gap-2 text-xl text-[#003399]">
                <span
                  className={cn(
                    'size-2.5 rounded-full',
                    status === 'ok' && 'bg-[#003399]',
                    status === 'checking' && 'bg-[#003399]/40',
                    status === 'degraded' && 'bg-[#d99a2b]',
                    status === 'down' && 'bg-[#DD3333]',
                  )}
                />
                {statusMeta.label}
              </span>
            }
            hint={statusMeta.hint}
          />
          <Stat label="Actualizado" value={updatedLabel} hint="Última consulta" />
        </div>
      </div>
    </section>
  )
}
