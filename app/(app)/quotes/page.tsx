'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import { quotesService } from '@/features/quotes/services/quotes.service'
import { QuoteListItem } from '@/features/quotes/components/quote-list-item'
import type { Quote } from '@/features/quotes/types'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    quotesService
      .list()
      .then(setQuotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function replaceQuote(updated: Quote) {
    setQuotes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
  }

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
          Flujo: borrador → enviada → aceptada → <b>Crear pedido</b>. Use un cliente del catálogo al cotizar para convertir más rápido.
        </p>
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        {!loading && quotes.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Sin cotizaciones aún. Crea la primera.
          </p>
        )}

        {quotes.map((q) => (
          <QuoteListItem key={q.id} quote={q} onChange={replaceQuote} onError={setError} />
        ))}
      </div>
    </main>
  )
}
