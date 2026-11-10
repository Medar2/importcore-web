import { cn } from '@/lib/utils'
import type { AgingBucket, AgingReport } from '../types'

export const BUCKET_META: Record<AgingBucket, { label: string; className: string }> = {
  CURRENT: { label: '0–30 días', className: 'text-success' },
  DAYS_31_60: { label: '31–60 días', className: 'text-info' },
  DAYS_61_90: { label: '61–90 días', className: 'text-warning' },
  OVER_90: { label: '+90 días', className: 'text-destructive' },
}

const BUCKETS = Object.keys(BUCKET_META) as AgingBucket[]

export const usd = (v: string) =>
  `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

interface Props {
  report: AgingReport
  selected: AgingBucket | null
  onSelect: (bucket: AgingBucket | null) => void
}

export function AgingSummary({ report, selected, onSelect }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase text-muted-foreground">Total por cobrar</p>
        <p className="text-xs text-muted-foreground">al {report.asOf}</p>
      </div>
      <p className="mt-1 text-2xl font-bold">{usd(report.totals.total)}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BUCKETS.map((b) => (
          <button
            key={b}
            onClick={() => onSelect(selected === b ? null : b)}
            className={cn(
              'rounded-lg border px-3 py-2 text-left transition',
              selected === b ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40',
            )}
          >
            <p className="text-[10px] uppercase text-muted-foreground">{BUCKET_META[b].label}</p>
            <p className={cn('font-bold', BUCKET_META[b].className)}>{usd(report.totals[b])}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
