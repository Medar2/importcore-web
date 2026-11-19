import type { ElementType } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface AdminSectionCardProps {
  label: string
  hint: string
  icon: ElementType
  href: string
  tone?: 'blue' | 'red'
}

export function AdminSectionCard({ label, hint, icon: Icon, href, tone }: AdminSectionCardProps) {
  const iconCls =
    tone === 'red'
      ? 'bg-[#DD3333] text-white'
      : tone === 'blue'
        ? 'bg-[#003399] text-white'
        : 'bg-primary/10 text-primary'
  const cardCls = tone
    ? 'flex min-w-0 items-center gap-3 rounded-2xl border border-[#003399]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
    : 'flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40'

  return (
    <Link href={href} className={cardCls}>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
