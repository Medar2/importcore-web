import { MODULES, type ModuleDef, type ModuleStat } from '../modules'
import { SectionHeading } from './brand'
import { ModuleCard } from './module-card'

interface ModuleGridProps {
  stats: Record<string, ModuleStat>
  loading: boolean
  modules?: ModuleDef[]
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#003399]/10 bg-white">
      <div className="h-1.5 bg-[#003399]/20" />
      <div className="p-4">
        <div className="size-11 animate-pulse rounded-xl bg-[#003399]/10" />
        <div className="mt-4 space-y-2">
          <div className="h-8 w-16 animate-pulse rounded bg-[#003399]/10" />
          <div className="h-4 w-28 animate-pulse rounded bg-[#23232C]/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-[#23232C]/10" />
        </div>
      </div>
    </div>
  )
}

export function ModuleGrid({ stats, loading, modules = MODULES }: ModuleGridProps) {
  return (
    <section className="mt-8">
      <SectionHeading
        kicker="Operación"
        title="Módulos"
        hint="Cada área del flujo, de la cotización al contenedor."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: modules.length }).map((_, i) => <SkeletonCard key={i} />)
          : modules.map((m, index) => (
              <ModuleCard
                key={m.href}
                def={m}
                stat={stats[m.href]}
                tone={index % 2 === 0 ? 'blue' : 'red'}
              />
            ))}
      </div>
    </section>
  )
}
