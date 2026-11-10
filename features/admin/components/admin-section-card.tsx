import type { ElementType } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface AdminSectionCardProps {
  label: string
  hint: string
  icon: ElementType
  href: string
}

const cardCls =
  'flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40'

export function AdminSectionCard({ label, hint, icon: Icon, href }: AdminSectionCardProps) {
  return (
    <Link href={href} className={cardCls}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
