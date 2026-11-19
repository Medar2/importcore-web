'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Ship } from 'lucide-react'
import { quotesService } from '@/features/quotes/services/quotes.service'
import { QuoteWorkflowActions } from '@/features/quotes/components/quote-workflow-actions'
import type { QuoteDetail, QuoteItemBreakdown, QuoteRequestSnapshot } from '@/features/quotes/types'
import {
  CONTAINER_STATUS_LABEL,
  CONTAINER_TYPE_LABEL,
  PRORATION_LABEL,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_STYLE,
  formatQty,
  formatRate,
  formatUsd,
} from '@/features/quotes/utils/quote-status'
import { STATUS_LABEL } from '@/features/orders/utils/order-status'
import { withPermission } from '@/features/auth/components/permission-gate'
import { IMPORTCORE_PERMS } from '@/features/auth/utils/permissions'

function containerLabel(type: string | null | undefined) {
  if (!type) return '—'
  return CONTAINER_TYPE_LABEL[type] ?? type
}

function reservationCopy(quote: QuoteDetail): string {
  const space = quote.reservation
  const cbm = formatQty(space.cbm)
  const share = space.shareCbmPercent != null ? ` (${formatQty(space.shareCbmPercent, 2)}% de la capacidad)` : ''

  if (space.heldBy === 'QUOTE' && space.container) {
    return `Reserva ${cbm} CBM${share} en ${space.container.containerNumber}. El espacio se mantiene mientras la cotización esté en borrador, enviada o aceptada.`
  }
  if (space.heldBy === 'ORDER') {
    const target = quote.order ? `al pedido ${quote.order.orderNumber}` : 'al pedido'
    return `Esta cotización ya no reserva espacio. La carga de ${cbm} CBM pasó ${target}.`
  }
  if (quote.status === 'REJECTED') {
    return `Rechazada. Los ${cbm} CBM no ocupan contenedor.`
  }
  if (!space.container) {
    return `Sin contenedor asignado. La carga es de ${cbm} CBM y el contenedor recomendado es ${containerLabel(space.recommendedContainer)}. No hay reserva hasta asignar un contenedor al cotizar.`
  }
  return `Asignada a ${space.container.containerNumber}, sin ocupación activa. Carga calculada: ${cbm} CBM.`
}

function LineDetail({
  item,
  source,
}: {
  item: QuoteItemBreakdown
  source: NonNullable<QuoteRequestSnapshot['items']>[number] | undefined
}) {
  const dims =
    source?.lengthM && source.widthM && source.heightM
      ? `${formatQty(source.lengthM)} × ${formatQty(source.widthM)} × ${formatQty(source.heightM)} m`
      : null

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{item.description || 'Partida sin descripción'}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatQty(item.units, 0)} unidades
            {source?.boxesCount != null ? ` · ${source.boxesCount} cajas` : ''}
            {source?.unitsPerBox != null ? ` · ${source.unitsPerBox} und/caja` : ''}
            {dims ? ` · ${dims}` : ''}
            {source?.boxGrossWeightKg ? ` · ${formatQty(source.boxGrossWeightKg, 2)} kg/caja` : ''}
          </p>
        </div>
        <p className="text-sm font-semibold">{formatUsd(item.landedCostUsd)}</p>
      </div>

      {source?.rates && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Gravamen {formatRate(source.rates.gravamenRate)} · ITBIS {formatRate(source.rates.itbisRate)} · Selectivo{' '}
          {formatRate(source.rates.selectivoRate)}
        </p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">CBM</dt>
          <dd className="font-medium">{formatQty(item.cbm)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">FOB</dt>
          <dd className="font-medium">{formatUsd(item.fobUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Flete</dt>
          <dd className="font-medium">{formatUsd(item.proratedFreightUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Seguro</dt>
          <dd className="font-medium">{formatUsd(item.proratedInsuranceUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">CIF</dt>
          <dd className="font-medium">{formatUsd(item.cifUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Gravamen</dt>
          <dd className="font-medium">{formatUsd(item.gravamenUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Selectivo</dt>
          <dd className="font-medium">{formatUsd(item.selectivoUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">ITBIS</dt>
          <dd className="font-medium">{formatUsd(item.itbisUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Landed / und.</dt>
          <dd className="font-medium">{formatUsd(item.unitLandedCostUsd)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Precio cliente / und.</dt>
          <dd className="font-medium">{formatUsd(item.unitCustomerPriceUsd)}</dd>
        </div>
      </dl>
    </article>
  )
}

function QuoteDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    quotesService
      .get(id)
      .then(setQuote)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo abrir la cotización'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !quote) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    )
  }
  if (!quote) {
    return (
      <main className="p-6 text-sm text-destructive">
        {error ?? 'Cotización no encontrada'}
      </main>
    )
  }

  const totals = quote.calculationResult.totals
  const snapshot = quote.requestSnapshot
  const space = quote.reservation
  const container = space.container
  const expired =
    !!quote.validUntil &&
    quote.validUntil < new Date().toISOString().slice(0, 10) &&
    quote.status !== 'CONVERTED' &&
    quote.status !== 'REJECTED'
  const customerName = quote.customer?.name ?? quote.customerName ?? 'Sin cliente'
  const customerHref = quote.customer?.id ? `/customers/${quote.customer.id}` : null
  const occupancy = container?.occupancyCbmPercent
  const barWidth = occupancy == null ? 0 : Math.min(100, Math.max(0, occupancy))

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <Link href="/quotes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Cotizaciones
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-bold">{quote.quoteNumber}</h1>
            <p className="text-xs text-muted-foreground">
              {customerHref ? (
                <Link href={customerHref} className="text-primary hover:underline">
                  {customerName}
                </Link>
              ) : (
                customerName
              )}{' '}
              · {quote.createdAt.slice(0, 10)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUOTE_STATUS_STYLE[quote.status]}`}>
              {QUOTE_STATUS_LABEL[quote.status]}
            </span>
            {expired && (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                Vencida
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Cliente y vigencia</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Cliente</dt>
              <dd className="font-medium">
                {customerHref ? (
                  <Link href={customerHref} className="text-primary hover:underline">
                    {customerName}
                  </Link>
                ) : (
                  customerName
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">RNC / cédula</dt>
              <dd className="font-medium">{quote.customer?.taxId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Teléfono</dt>
              <dd className="font-medium">{quote.customer?.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Correo</dt>
              <dd className="font-medium">{quote.customer?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Creada</dt>
              <dd className="font-medium">{quote.createdAt.slice(0, 10)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Vigente hasta</dt>
              <dd className="font-medium">{quote.validUntil ?? 'Sin vencimiento'}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <QuoteWorkflowActions
              quote={quote}
              onChange={() => {
                setError(null)
                load()
              }}
              onError={setError}
            />
          </div>
          {quote.order && (
            <Link
              href={`/orders/${quote.order.id}`}
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Pedido {quote.order.orderNumber} · {STATUS_LABEL[quote.order.status as keyof typeof STATUS_LABEL] ?? quote.order.status}
            </Link>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Ship className="size-4 text-primary" /> Reserva de espacio
            </h2>
            {space.reservesSpace ? (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                Reservado
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Sin reserva
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed">{reservationCopy(quote)}</p>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-lg bg-muted/40 p-2">
              <span className="block text-[10px] uppercase text-muted-foreground">CBM</span>
              <span className="font-semibold">{formatQty(space.cbm)}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <span className="block text-[10px] uppercase text-muted-foreground">Peso</span>
              <span className="font-semibold">{formatQty(space.weightKg, 2)} kg</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <span className="block text-[10px] uppercase text-muted-foreground">Recomendado</span>
              <span className="font-semibold">{containerLabel(space.recommendedContainer)}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-2">
              <span className="block text-[10px] uppercase text-muted-foreground">Cotizado como</span>
              <span className="font-semibold">{containerLabel(snapshot?.containerType)}</span>
            </div>
          </div>

          {container && (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-medium">
                  {container.containerNumber} · {containerLabel(container.containerType)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {CONTAINER_STATUS_LABEL[container.status] ?? container.status}
                </span>
              </div>
              {occupancy != null && (
                <>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${container.isOverloaded ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ocupación {formatQty(occupancy, 1)}% · quedan {formatQty(container.remainingCbm)} CBM de{' '}
                    {formatQty(container.capacityCbm, 0)}
                    {container.isOverloaded ? ' · contenedor sobrecargado' : ''}
                  </p>
                </>
              )}
              <p className="text-xs text-muted-foreground">
                ETD {container.etd ?? '—'} · ETA {container.eta ?? '—'} · ATA {container.ata ?? '—'}
                {container.blNumber ? ` · BL ${container.blNumber}` : ''}
              </p>
              <Link href="/containers" className="inline-flex text-xs font-medium text-primary hover:underline">
                Ver contenedores
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Totales</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">FOB</dt>
              <dd>{formatUsd(totals.fobUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Flete</dt>
              <dd>{formatUsd(totals.freightUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Seguro</dt>
              <dd>{formatUsd(totals.insuranceUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">CIF</dt>
              <dd>{formatUsd(totals.cifUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Gravamen</dt>
              <dd>{formatUsd(totals.gravamenUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Selectivo</dt>
              <dd>{formatUsd(totals.selectivoUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">ITBIS</dt>
              <dd>{formatUsd(totals.itbisUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Landed cost</dt>
              <dd className="font-semibold">{formatUsd(totals.landedCostUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Precio cliente</dt>
              <dd className="font-semibold">{formatUsd(totals.customerPriceUsd ?? quote.customerPriceUsd)}</dd>
            </div>
          </dl>
        </section>

        {snapshot && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Condiciones del cálculo</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Prorrateo</dt>
                <dd>{PRORATION_LABEL[snapshot.prorationBasis ?? ''] ?? snapshot.prorationBasis ?? 'Volumen (CBM)'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Markup</dt>
                <dd>{snapshot.markupPercent != null && snapshot.markupPercent !== '' ? `${snapshot.markupPercent}%` : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Flete del contenedor</dt>
                <dd>{formatUsd(snapshot.containerFreightUsd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Seguro del contenedor</dt>
                <dd>{formatUsd(snapshot.containerInsuranceUsd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Gastos locales</dt>
                <dd>{formatUsd(snapshot.localExpensesUsd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Comisiones bancarias</dt>
                <dd>{formatUsd(snapshot.bankFeesUsd)}</dd>
              </div>
            </dl>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            Partidas ({quote.calculationResult.items.length})
          </h2>
          {quote.calculationResult.items.map((item, index) => (
            <LineDetail key={`${item.description ?? 'item'}-${index}`} item={item} source={snapshot?.items?.[index]} />
          ))}
        </section>
      </div>
    </main>
  )
}

export default withPermission([IMPORTCORE_PERMS.QUOTES_READ], QuoteDetailPageContent)
