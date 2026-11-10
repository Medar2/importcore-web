import { MODULES, type ModuleStat } from '../modules'
import { ModuleCard } from './module-card'

interface ModuleGridProps {
  stats: Record<string, ModuleStat>
  loading: boolean
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="size-11 animate-pulse rounded-xl bg-muted" />
        <div className="size-4 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-7 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 border-t border-border/60 pt-3">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  )
}

export function ModuleGrid({ stats, loading }: ModuleGridProps) {
  return (
    <section className="mt-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold">Módulos</h2>
        <p className="text-xs text-muted-foreground">
          Acceso directo a cada área operativa.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: MODULES.length }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : MODULES.map((m) => (
              <ModuleCard key={m.href} def={m} stat={stats[m.href]} />
            ))}
      </div>
    </section>
  )
}
