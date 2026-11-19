'use client'

import Link from 'next/link'
import type { Quote } from '../types'
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_STYLE, formatQty, formatUsd } from '../utils/quote-status'
import { QuoteWorkflowActions } from './quote-workflow-actions'

interface QuoteListItemProps {
  quote: Quote
  onChange: (quote: Quote) => void
  onError: (msg: string) => void
}

export function QuoteListItem({ quote, onChange, onError }: QuoteListItemProps) {
  const name = quote.customer?.name ?? quote.customerName ?? 'Sin cliente'
  const date = quote.createdAt.slice(0, 10)

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/quotes/${quote.id}`} className="font-semibold text-primary hover:underline">
            {quote.quoteNumber}
          </Link>
          <p className="text-xs text-muted-foreground">
            {quote.customer?.id ? (
              <Link href={`/customers/${quote.customer.id}`} className="font-medium text-primary hover:underline">
                {name}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{name}</span>
            )}
            {' · '}
            {date}
            {quote.cbm ? ` · ${formatQty(quote.cbm)} CBM` : ''}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUOTE_STATUS_STYLE[quote.status]}`}>
          {QUOTE_STATUS_LABEL[quote.status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Landed: </span>
          <b>{formatUsd(quote.landedCostUsd)}</b>
          {quote.customerPriceUsd && (
            <>
              <span className="ml-3 text-muted-foreground">Cliente: </span>
              <b>{formatUsd(quote.customerPriceUsd)}</b>
            </>
          )}
        </div>
        <QuoteWorkflowActions quote={quote} onChange={onChange} onError={onError} />
      </div>
    </article>
  )
}
