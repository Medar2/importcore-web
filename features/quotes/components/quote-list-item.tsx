'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, FileText, Loader2 } from 'lucide-react'
import { quotesService } from '../services/quotes.service'
import type { Quote } from '../types'
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_STYLE } from '../utils/quote-status'
import { ordersService } from '@/features/orders/services/orders.service'
import { customersService } from '@/features/customers/services/customers.service'
import type { Customer } from '@/features/customers/types'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { can } from '@/features/auth/utils/permissions'

const btn =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition hover:bg-secondary disabled:opacity-50'
const btnPrimary =
  'flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-50'

interface QuoteListItemProps {
  quote: Quote
  onChange: (quote: Quote) => void
  onError: (msg: string) => void
}

export function QuoteListItem({ quote, onChange, onError }: QuoteListItemProps) {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [busy, setBusy] = useState<string | null>(null)
  const [pickCustomer, setPickCustomer] = useState(false)
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [customerId, setCustomerId] = useState(quote.customerId ?? '')

  const canUpdate = can(user, 'IMPORTCORE.QUOTES.UPDATE')
  const canConvert = can(user, 'IMPORTCORE.ORDERS.WRITE')

  async function setStatus(status: Quote['status']) {
    setBusy(status)
    onError('')
    try {
      const updated = await quotesService.setStatus(quote.id, status)
      onChange(updated)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo actualizar')
    } finally {
      setBusy(null)
    }
  }

  async function openConvert() {
    if (quote.customerId) {
      await convert(quote.customerId)
      return
    }
    setPickCustomer(true)
    if (!customers) {
      try {
        setCustomers(await customersService.list())
      } catch (e) {
        onError(e instanceof Error ? e.message : 'No se pudieron cargar clientes')
        setPickCustomer(false)
      }
    }
  }

  async function convert(custId: string) {
    if (!custId) {
      onError('Seleccione un cliente para el pedido')
      return
    }
    setBusy('convert')
    onError('')
    try {
      const order = await ordersService.create({ quoteId: quote.id, customerId: custId })
      onChange({ ...quote, status: 'CONVERTED' })
      setPickCustomer(false)
      router.push(`/orders/${order.id}`)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo crear el pedido')
    } finally {
      setBusy(null)
    }
  }

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{quote.quoteNumber}</p>
          <p className="text-xs text-muted-foreground">
            {quote.customer?.name ?? quote.customerName ?? 'Sin cliente'} · {quote.createdAt.slice(0, 10)}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUOTE_STATUS_STYLE[quote.status]}`}>
          {QUOTE_STATUS_LABEL[quote.status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Landed: </span>
          <b>${Number(quote.landedCostUsd).toFixed(2)}</b>
          {quote.customerPriceUsd && (
            <>
              <span className="ml-3 text-muted-foreground">Cliente: </span>
              <b>${Number(quote.customerPriceUsd).toFixed(2)}</b>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {quote.status === 'DRAFT' && canUpdate && (
            <button type="button" disabled={!!busy} onClick={() => setStatus('SENT')} className={btn}>
              {busy === 'SENT' ? <Loader2 className="size-3.5 animate-spin" /> : 'Marcar enviada'}
            </button>
          )}
          {quote.status === 'SENT' && canUpdate && (
            <>
              <button type="button" disabled={!!busy} onClick={() => setStatus('ACCEPTED')} className={btnPrimary}>
                {busy === 'ACCEPTED' ? <Loader2 className="size-3.5 animate-spin" /> : 'Aceptada'}
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => setStatus('REJECTED')}
                className="rounded-lg border border-destructive/40 px-2.5 py-1 text-xs font-medium text-destructive"
              >
                Rechazar
              </button>
            </>
          )}
          {quote.status === 'ACCEPTED' && canConvert && (
            <button type="button" disabled={!!busy} onClick={openConvert} className={btnPrimary}>
              {busy === 'convert' ? <Loader2 className="size-3.5 animate-spin" /> : <ClipboardList className="size-3.5" />}
              Crear pedido
            </button>
          )}
          <button
            type="button"
            onClick={() => quotesService.pdf(quote.id, quote.quoteNumber).catch((e) => onError(e.message))}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
          >
            <FileText className="size-3.5" /> PDF
          </button>
        </div>
      </div>

      {pickCustomer && (
        <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="mb-2 text-xs font-medium">Vincule un cliente del catálogo para el pedido</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Seleccionar…</option>
              {(customers ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.taxId})
                </option>
              ))}
            </select>
            <button type="button" disabled={!!busy} onClick={() => convert(customerId)} className={btnPrimary}>
              Confirmar pedido
            </button>
            <button type="button" onClick={() => setPickCustomer(false)} className={btn}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
