'use client'

import { Trash2 } from 'lucide-react'
import type { Product } from '@/features/products/types'

export interface ItemForm {
  productId: string
  description: string
  unitsPerBox: string
  boxesCount: string
  lengthM: string
  widthM: string
  heightM: string
  unitFobPriceUsd: string
  boxGrossWeightKg: string
  gravamenRate: string
  itbisRate: string
  selectivoRate: string
}

export const EMPTY_ITEM: ItemForm = {
  productId: '',
  description: '',
  unitsPerBox: '1',
  boxesCount: '1',
  lengthM: '',
  widthM: '',
  heightM: '',
  unitFobPriceUsd: '',
  boxGrossWeightKg: '',
  gravamenRate: '0.20',
  itbisRate: '0.18',
  selectivoRate: '0',
}

export const CONTAINER_SPECS: Record<string, { cbm: number; kg: number }> = {
  '20_ST': { cbm: 28, kg: 21500 },
  '40_ST': { cbm: 58, kg: 26000 },
  '40_HC': { cbm: 68, kg: 26000 },
  LCL: { cbm: Infinity, kg: Infinity },
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

export function itemCbm(it: ItemForm): number {
  const boxes = Number(it.boxesCount) || 0
  const cbmBox = (Number(it.lengthM) || 0) * (Number(it.widthM) || 0) * (Number(it.heightM) || 0)
  return boxes * cbmBox
}

export function applyProduct(it: ItemForm, p: Product | undefined): ItemForm {
  if (!p) return { ...it, productId: '' }
  const th = p.tariffHeading
  return {
    ...it,
    productId: p.id,
    description: p.description,
    unitsPerBox: String(p.unitsPerBox),
    lengthM: p.boxLengthM,
    widthM: p.boxWidthM,
    heightM: p.boxHeightM,
    boxGrossWeightKg: p.boxGrossWeightKg ?? '',
    unitFobPriceUsd: p.unitFobPriceUsd ?? '',
    gravamenRate: th?.gravamenRate ?? it.gravamenRate,
    itbisRate: th?.itbisRate ?? it.itbisRate,
    selectivoRate: th?.selectivoRate ?? it.selectivoRate,
  }
}

export default function QuoteItemCard({
  index,
  item,
  products,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number
  item: ItemForm
  products: Product[]
  canRemove: boolean
  onChange: (patch: Partial<ItemForm>) => void
  onRemove: () => void
}) {
  const cbm = itemCbm(item)
  const cbmPerBox =
    (Number(item.lengthM) || 0) * (Number(item.widthM) || 0) * (Number(item.heightM) || 0)
  const selected = products.find((p) => p.id === item.productId)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">
          Ítem {index + 1}
          {selected && <span className="ml-1 text-primary">· {selected.sku}</span>}
        </span>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {cbm.toFixed(3)} CBM total
          </span>
          {canRemove && (
            <button type="button" onClick={onRemove}>
              <Trash2 className="size-4 text-destructive" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 flex flex-col gap-1 text-[10px] text-muted-foreground">
          Producto del catálogo
          <select
            className={inputCls}
            value={item.productId}
            onChange={(e) => onChange(applyProduct(item, products.find((p) => p.id === e.target.value)))}
          >
            <option value="">— Texto libre / sin producto —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} · {p.description}
              </option>
            ))}
          </select>
        </label>

        <input
          className={`${inputCls} col-span-2`}
          placeholder="Descripción *"
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
        <input className={inputCls} type="number" min={1} placeholder="Unidades/caja *" value={item.unitsPerBox} onChange={(e) => onChange({ unitsPerBox: e.target.value })} />
        <input className={inputCls} type="number" min={0} placeholder="Nº de cajas *" value={item.boxesCount} onChange={(e) => onChange({ boxesCount: e.target.value })} />
        <input className={inputCls} placeholder="Largo caja (m) *" value={item.lengthM} onChange={(e) => onChange({ lengthM: e.target.value })} />
        <input className={inputCls} placeholder="Ancho caja (m) *" value={item.widthM} onChange={(e) => onChange({ widthM: e.target.value })} />
        <input className={inputCls} placeholder="Alto caja (m) *" value={item.heightM} onChange={(e) => onChange({ heightM: e.target.value })} />
        <input className={inputCls} placeholder="Peso caja kg" value={item.boxGrossWeightKg} onChange={(e) => onChange({ boxGrossWeightKg: e.target.value })} />
        <input className={inputCls} placeholder="FOB unitario USD *" value={item.unitFobPriceUsd} onChange={(e) => onChange({ unitFobPriceUsd: e.target.value })} />
        <input className={inputCls} placeholder="Gravamen (ej. 0.20) *" value={item.gravamenRate} onChange={(e) => onChange({ gravamenRate: e.target.value })} />
        <input className={inputCls} placeholder="ITBIS" value={item.itbisRate} onChange={(e) => onChange({ itbisRate: e.target.value })} />
        <input className={`${inputCls} col-span-2`} placeholder="Selectivo" value={item.selectivoRate} onChange={(e) => onChange({ selectivoRate: e.target.value })} />
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">
        {cbmPerBox > 0
          ? `${cbmPerBox.toFixed(4)} CBM/caja × ${item.boxesCount || 0} cajas · ${item.unitsPerBox || 0} unid/caja`
          : 'Completa dimensiones para ver el CBM'}
      </p>
    </div>
  )
}
