'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { quotesService } from '@/features/quotes/services/quotes.service'
import type { QuoteItemInput } from '@/features/quotes/services/quotes.service'
import { productsService } from '@/features/products/services/products.service'
import type { Product } from '@/features/products/types'
import { customersService } from '@/features/customers/services/customers.service'
import type { Customer } from '@/features/customers/types'
import { containersService } from '@/features/shipping/services/containers.service'
import type { ContainerAvailability } from '@/features/shipping/services/containers.service'
import QuoteItemCard, {
  CONTAINER_SPECS,
  EMPTY_ITEM,
  itemCbm,
  type ItemForm,
} from '@/features/quotes/components/quote-item-card'

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

function toItem(f: ItemForm): QuoteItemInput {
  return {
    description: f.description || undefined,
    unitsPerBox: Number(f.unitsPerBox),
    boxesCount: Number(f.boxesCount),
    lengthM: f.lengthM,
    widthM: f.widthM,
    heightM: f.heightM,
    unitFobPriceUsd: f.unitFobPriceUsd,
    boxGrossWeightKg: f.boxGrossWeightKg || undefined,
    rates: {
      gravamenRate: f.gravamenRate,
      itbisRate: f.itbisRate || undefined,
      selectivoRate: f.selectivoRate || undefined,
    },
  }
}

export default function NewQuotePage() {
  const router = useRouter()
  const [items, setItems] = useState<ItemForm[]>([{ ...EMPTY_ITEM }])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [containers, setContainers] = useState<ContainerAvailability[]>([])
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [containerId, setContainerId] = useState('')
  const [containerType, setContainerType] = useState('20_ST')
  const [freight, setFreight] = useState('800')
  const [insurance, setInsurance] = useState('0')
  const [markup, setMarkup] = useState('0.25')
  const [validDays, setValidDays] = useState('15')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    productsService.list().then(setProducts).catch(() => {})
    customersService.list().then(setCustomers).catch(() => {})
    containersService.availability().then(setContainers).catch(() => {})
  }, [])

  function selectContainer(value: string) {
    setContainerId('')
    if (value.startsWith('existing:')) {
      const id = value.slice(9)
      const c = containers.find((x) => x.id === id)
      setContainerId(id)
      if (c) setContainerType(c.containerType)
    } else {
      setContainerType(value)
    }
  }

  function selectCustomer(id: string) {
    setCustomerId(id)
    const c = customers.find((x) => x.id === id)
    if (c) setCustomerName(c.name)
  }

  function update(i: number, patch: Partial<ItemForm>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  const totalCbm = items.reduce((a, it) => a + itemCbm(it), 0)
  const totalUnits = items.reduce(
    (a, it) => a + (Number(it.unitsPerBox) || 0) * (Number(it.boxesCount) || 0),
    0,
  )
  const spec = CONTAINER_SPECS[containerType]
  const selectedContainer = containers.find((c) => c.id === containerId)
  const effectiveCapacity = selectedContainer
    ? Number(selectedContainer.remainingCbm)
    : spec?.cbm ?? null
  const fitPct =
    effectiveCapacity && Number.isFinite(effectiveCapacity)
      ? (totalCbm / effectiveCapacity) * 100
      : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await quotesService.create({
        customerName: customerId ? undefined : customerName || undefined,
        customerId: customerId || undefined,
        validDays: Number(validDays) || undefined,
        containerId: containerId || undefined,
        items: items.map(toItem),
        containerType: containerType as '20_ST',
        containerFreightUsd: freight,
        containerInsuranceUsd: insurance || undefined,
        markupPercent: markup || undefined,
      })
      router.push('/quotes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Nueva cotización</h1>
      </header>

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 p-4">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Cliente y contenedor</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              Cliente
              <select className={inputCls} value={customerId} onChange={(e) => selectCustomer(e.target.value)}>
                <option value="">— Texto libre / sin registrar —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.taxId}
                  </option>
                ))}
              </select>
            </label>
            {!customerId && (
              <input
                className={`${inputCls} col-span-2`}
                placeholder="Nombre del cliente (texto libre)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            )}
            <label className="flex flex-col gap-1 text-xs">
              Contenedor
              <select
                className={inputCls}
                value={containerId ? `existing:${containerId}` : containerType}
                onChange={(e) => selectContainer(e.target.value)}
              >
                <optgroup label="Contenedores en proceso">
                  {containers.map((c) => (
                    <option key={c.id} value={`existing:${c.id}`}>
                      {c.containerNumber} · {c.containerType} — quedan{' '}
                      {Number(c.remainingCbm).toFixed(1)} CBM
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Nuevo contenedor">
                  <option value="20_ST">20 pies (28 CBM)</option>
                  <option value="40_ST">40 pies (58 CBM)</option>
                  <option value="40_HC">40 HC (68 CBM)</option>
                  <option value="LCL">LCL</option>
                </optgroup>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Vigencia (días)
              <input className={inputCls} type="number" min={1} value={validDays} onChange={(e) => setValidDays(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Flete USD
              <input className={inputCls} value={freight} onChange={(e) => setFreight(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              Seguro USD
              <input className={inputCls} value={insurance} onChange={(e) => setInsurance(e.target.value)} />
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              Markup % sobre landed cost
              <input className={inputCls} value={markup} onChange={(e) => setMarkup(e.target.value)} />
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Partidas ({items.length})</h2>
            <button
              type="button"
              onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])}
              className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" /> Ítem
            </button>
          </div>

          {items.map((it, i) => (
            <QuoteItemCard
              key={i}
              index={i}
              item={it}
              products={products}
              canRemove={items.length > 1}
              onChange={(patch) => update(i, patch)}
              onRemove={() => setItems((p) => p.filter((_, x) => x !== i))}
            />
          ))}

          {/* Resumen de carga */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span><b>{totalUnits.toLocaleString()}</b> unidades</span>
              <span><b>{totalCbm.toFixed(3)}</b> CBM total</span>
              {fitPct !== null && (
                <span className={fitPct > 100 ? 'font-bold text-destructive' : 'text-success'}>
                  {fitPct.toFixed(1)}% de{' '}
                  {selectedContainer
                    ? `espacio restante (${selectedContainer.containerNumber})`
                    : containerType}
                </span>
              )}
            </div>
            {fitPct !== null && fitPct > 100 && (
              <p className="mt-1 text-xs font-semibold text-destructive">
                La carga excede la capacidad del contenedor — sube a un 40 HC o divide en dos.
              </p>
            )}
          </div>
        </section>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? 'Calculando…' : 'Calcular y guardar cotización'}
        </button>
      </form>
    </main>
  )
}
