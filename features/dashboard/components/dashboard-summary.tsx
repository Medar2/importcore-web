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
  valueClassName,
}: {
  label: string
  value: ReactNode
  hint: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className={cn('mt-1 text-xl font-bold tabular-nums', valueClassName)}>
        {value}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
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
    checking: {
      label: 'Verificando',
      dot: 'bg-muted-foreground',
      valueClassName: 'text-muted-foreground',
      hint: 'Consultando endpoints',
    },
    ok: {
      label: 'Operativa',
      dot: 'bg-success',
      valueClassName: 'text-success',
      hint: 'Todos los endpoints respondieron',
    },
    degraded: {
      label: 'Parcial',
      dot: 'bg-warning',
      valueClassName: 'text-warning',
      hint: `${failedCount} módulo(s) sin respuesta`,
    },
    down: {
      label: 'Sin conexión',
      dot: 'bg-destructive',
      valueClassName: 'text-destructive',
      hint: 'API no disponible',
    },
  }[status]

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Panel de operación
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Resumen general
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Estado de los módulos de ImportCore RD.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/quotes/new"
              className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
            >
              <Plus className="size-4" /> Nueva cotización
            </Link>
            <Link
              href="/orders"
              className="flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              <ClipboardList className="size-4" /> Pedidos
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Registros totales"
            value={loading ? '…' : totalRecords.toLocaleString('es-DO')}
            hint="Suma de módulos cargados"
          />
          <Stat
            label="Módulos con datos"
            value={loading ? '…' : `${modulesWithData}/${modulesTotal}`}
            hint="Con al menos un registro"
          />
          <Stat
            label="Estado API"
            value={
              <span className="inline-flex items-center gap-2">
                <span className={cn('size-2 rounded-full', statusMeta.dot)} />
                {statusMeta.label}
              </span>
            }
            valueClassName={statusMeta.valueClassName}
            hint={statusMeta.hint}
          />
          <Stat
            label="Actualizado"
            value={updatedLabel}
            hint="Última consulta al API"
          />
        </div>
      </div>
    </section>
  )
}
