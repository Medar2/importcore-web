'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { quotesService } from '@/features/quotes/services/quotes.service'
import { QuoteListItem } from '@/features/quotes/components/quote-list-item'
import type { Quote } from '@/features/quotes/types'
import { QUOTE_STATUS_LABEL, type QuoteStatus } from '@/features/quotes/utils/quote-status'

const PAGE_SIZE = 10
const STATUSES = Object.keys(QUOTE_STATUS_LABEL) as QuoteStatus[]

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    quotesService
      .list({ page, pageSize: PAGE_SIZE, status: status || undefined })
      .then((result) => {
        if (!active) return
        setQuotes(result.items)
        setTotal(result.total)
        const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE))
        if (page > pages) setPage(pages)
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar las cotizaciones')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, status, revision])

  function replaceQuote() {
    setError(null)
    setRevision((current) => current + 1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(total, page * PAGE_SIZE)

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Cotizaciones</h1>
        <Link
          href="/quotes/new"
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Nueva
        </Link>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        <p className="text-xs text-muted-foreground">
          El nombre abre la ficha con el desglose, el estado y la reserva de espacio. Flujo: borrador → enviada → aceptada → <b>Crear pedido</b>.
        </p>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Estado
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
              setLoading(true)
              setError(null)
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {QUOTE_STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        {loading && quotes.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        {!loading && quotes.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {status ? 'No hay cotizaciones en este estado.' : 'Sin cotizaciones aún. Crea la primera.'}
          </p>
        )}

        {quotes.map((quote) => (
          <QuoteListItem key={quote.id} quote={quote} onChange={replaceQuote} onError={setError} />
        ))}

        {total > 0 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground">
              {from}–{to} de {total}
              {loading ? ' · actualizando…' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => {
                  setLoading(true)
                  setPage((current) => current - 1)
                }}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" /> Anterior
              </button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => {
                  setLoading(true)
                  setPage((current) => current + 1)
                }}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium disabled:opacity-40"
              >
                Siguiente <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
