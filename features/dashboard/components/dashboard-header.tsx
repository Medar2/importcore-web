import { Calculator, RefreshCw } from 'lucide-react'
import { UserMenu } from '@/features/auth/components/user-menu'

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
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Calculator className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">ImportCore RD</p>
            <p className="truncate text-xs text-muted-foreground">
              Todo Import RD · importación por encargo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs capitalize text-muted-foreground sm:block">
            {dateLabel}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Actualizar dashboard"
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
