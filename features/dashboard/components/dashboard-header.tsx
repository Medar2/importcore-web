import { RefreshCw } from 'lucide-react'
import { FlagMark, Wordmark } from './brand'

interface DashboardHeaderProps {
  dateLabel: string
  refreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({
  dateLabel,
  refreshing,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-14 z-10 border-b border-[#003399]/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <FlagMark />
          <div className="min-w-0">
            <Wordmark />
            <p className="mt-1 truncate text-xs text-[#5c6472]">
              Importación por encargo{dateLabel ? ` · ${dateLabel}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Actualizar dashboard"
            className="flex size-9 items-center justify-center rounded-lg border border-[#003399]/15 bg-white text-[#003399] transition hover:bg-[#003399] hover:text-white disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="flex h-1" aria-hidden>
        <span className="flex-1 bg-[#003399]" />
        <span className="w-3 bg-white" />
        <span className="flex-1 bg-[#DD3333]" />
      </div>
    </header>
  )
}
