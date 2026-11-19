'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import type { ContainerOccupancy } from '../services/containers.service'
import { CONTAINER_TYPE_LABEL } from '@/features/quotes/utils/quote-status'

const CARGO = ['#0c4a6e', '#0f766e', '#9a3412', '#6d28d9', '#9f1239', '#1d4ed8', '#3f6212']

function qty(value: number, digits = 2) {
  return value.toLocaleString('es-DO', { maximumFractionDigits: digits })
}

interface ContainerBayProps {
  containerType: string
  occupancy: ContainerOccupancy | null
}

export function ContainerBay({ containerType, occupancy }: ContainerBayProps) {
  const rawId = useId().replace(/:/g, '')
  const [draft, setDraft] = useState('')
  const preview = Number(draft.replace(',', '.'))
  const hasPreview = draft.trim() !== '' && Number.isFinite(preview) && preview > 0

  if (!occupancy) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
        Calculando el espacio del contenedor…
      </div>
    )
  }

  const capacity = occupancy.capacityCbm
  const openEnded = !Number.isFinite(capacity) || capacity <= 0
  const used = occupancy.usedCbm
  const remaining = occupancy.remainingCbm
  const overloaded = occupancy.isOverloaded

  const innerX = 58
  const innerW = 500
  const innerY = 78
  const innerH = 132

  const basis = openEnded ? Math.max(used, 1) : overloaded ? Math.max(used, capacity) : capacity
  let cursor = innerX
  const blocks = occupancy.items.map((item, index) => {
    const width = basis > 0 ? (item.cbm / basis) * innerW : 0
    const block = { item, index, x: cursor, width }
    cursor += width
    return block
  })
  const freeW = openEnded || overloaded ? 0 : Math.max(0, innerX + innerW - cursor)
  const fits = hasPreview && !openEnded && !overloaded && preview <= remaining + 0.001
  const previewW = fits ? (preview / basis) * innerW : 0
  const typeLabel = CONTAINER_TYPE_LABEL[containerType] ?? containerType

  return (
    <div className="overflow-hidden rounded-xl border border-[#16325c]/20 bg-[#071426]">
      <div className="flex items-end justify-between gap-3 px-4 pt-3 text-white">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9db9dd]">Corte del contenedor</p>
          <p className="text-sm font-semibold">{typeLabel}</p>
        </div>
        <p className="text-right text-xs text-[#c5d4ea]">
          {openEnded ? (
            'LCL · sin tope de volumen'
          ) : (
            <>
              Libre <b className="text-white">{qty(remaining)} CBM</b>
              <span className="text-[#9db9dd]"> de {qty(capacity, 0)}</span>
            </>
          )}
        </p>
      </div>

      <svg viewBox="0 0 720 280" className="h-auto w-full" role="img" aria-label={`Contenedor ${typeLabel}. Libre ${qty(remaining)} CBM.`}>
        <defs>
          <pattern id={`${rawId}-corr`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M8 0 V16" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" />
          </pattern>
          <pattern id={`${rawId}-floor`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 14 H14" stroke="#94a3b8" strokeOpacity="0.45" />
          </pattern>
          <pattern id={`${rawId}-free`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
            <path d="M0 0 H10" stroke="#f8fafc" strokeOpacity="0.35" strokeWidth="3" />
          </pattern>
          <pattern id={`${rawId}-quote`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0 H8" stroke="#ffffff" strokeOpacity="0.28" />
          </pattern>
          <linearGradient id={`${rawId}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#12305c" />
            <stop offset="1" stopColor="#071426" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="720" height="280" fill={`url(#${rawId}-sky)`} />
        <ellipse cx="360" cy="252" rx="280" ry="10" fill="#000" opacity="0.35" />

        <path d="M48 64 H662 L688 40 H74 Z" fill="#0b2348" />
        <rect x="40" y="64" width="640" height="176" rx="4" fill="#14325f" />
        <rect x="40" y="64" width="640" height="176" fill={`url(#${rawId}-corr)`} />
        <rect x="40" y="64" width="14" height="176" fill="#0d274c" />
        <rect x="666" y="64" width="14" height="176" fill="#0d274c" />

        <rect x={innerX - 6} y={innerY - 8} width={innerW + 12} height={innerH + 16} fill="#dbe7f5" />
        <rect x={innerX} y={innerY} width={innerW} height={innerH} fill={`url(#${rawId}-floor)`} />
        <rect x={innerX} y={innerY} width={innerW} height={innerH} fill="#e7eef8" opacity="0.72" />

        {blocks.map(({ item, index, x, width }) => {
          if (width < 0.5) return null
          const fill = CARGO[index % CARGO.length]
          return (
            <g key={item.id}>
              <rect x={x} y={innerY + 8} width={Math.max(width - 2, 1)} height={innerH - 16} rx="2" fill={fill} />
              {item.type === 'QUOTE' && (
                <rect x={x} y={innerY + 8} width={Math.max(width - 2, 1)} height={innerH - 16} fill={`url(#${rawId}-quote)`} />
              )}
              {width > 54 && (
                <text x={x + 8} y={innerY + 36} fill="#fff" fontSize="11" fontWeight="700">
                  {item.reference.length > 14 ? `${item.reference.slice(0, 12)}…` : item.reference}
                </text>
              )}
              {width > 54 && (
                <text x={x + 8} y={innerY + 54} fill="#e2e8f0" fontSize="10">
                  {qty(item.cbm)} CBM
                </text>
              )}
            </g>
          )
        })}

        {freeW > 1 && (
          <g>
            <rect x={cursor} y={innerY + 8} width={freeW - 2} height={innerH - 16} fill={`url(#${rawId}-free)`} />
            {fits && previewW > 1 && (
              <g>
                <rect
                  x={cursor + 3}
                  y={innerY + 18}
                  width={Math.max(previewW - 6, 2)}
                  height={innerH - 36}
                  rx="3"
                  fill="#ce1126"
                />
                {previewW > 72 && (
                  <text x={cursor + previewW / 2} y={innerY + 78} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
                    Pedido
                  </text>
                )}
                {previewW > 72 && (
                  <text x={cursor + previewW / 2} y={innerY + 96} textAnchor="middle" fill="#ffe4e6" fontSize="11">
                    {qty(preview)} CBM
                  </text>
                )}
              </g>
            )}
            {freeW - (fits ? previewW : 0) > 96 && (
              <text
                x={cursor + (fits ? previewW : 0) + (freeW - (fits ? previewW : 0)) / 2}
                y={innerY + 78}
                textAnchor="middle"
                fill="#0f1e33"
                fontSize="13"
                fontWeight="700"
              >
                Espacio libre
              </text>
            )}
            {freeW - (fits ? previewW : 0) > 96 && (
              <text
                x={cursor + (fits ? previewW : 0) + (freeW - (fits ? previewW : 0)) / 2}
                y={innerY + 98}
                textAnchor="middle"
                fill="#16345c"
                fontSize="12"
              >
                {qty(fits ? remaining - preview : remaining)} CBM
              </text>
            )}
          </g>
        )}

        <rect x="40" y="220" width="640" height="20" fill="#0c2344" />
        {[0, 1, 2, 3].map((n) => (
          <rect key={n} x={48 + n * 158} y={68} width="10" height="10" fill="#f4c542" />
        ))}
        <rect x="612" y="86" width="6" height="128" fill="#e8eef7" opacity="0.8" />
        <rect x="636" y="86" width="6" height="128" fill="#e8eef7" opacity="0.8" />
        <rect x="608" y="140" width="40" height="8" rx="2" fill="#ce1126" />
      </svg>

      <div className="grid gap-3 px-4 pb-4 text-white sm:grid-cols-[1fr_220px]">
        <div>
          <div className="mb-2 flex flex-wrap gap-3 text-[11px] text-[#c5d4ea]">
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-[#0c4a6e]" /> Pedido
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-[#0f766e]" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#0f766e,#0f766e 2px,#fff 2px,#fff 3px)' }} />
              Cotización
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-white/30" /> Libre
            </span>
          </div>
          {occupancy.items.length === 0 ? (
            <p className="text-sm text-[#dbe7f5]">El contenedor está vacío. Todo el volumen está disponible para el primer pedido.</p>
          ) : (
            <ul className="space-y-1.5">
              {occupancy.items.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <Link
                    href={item.type === 'ORDER' ? `/orders/${item.id}` : `/quotes/${item.id}`}
                    className="flex min-w-0 items-center gap-2 hover:underline"
                  >
                    <i className="size-2.5 shrink-0 rounded-sm" style={{ background: CARGO[index % CARGO.length] }} />
                    <span className="truncate font-semibold">{item.reference}</span>
                    <span className="truncate text-[#9db9dd]">{item.customerName ?? 'Cliente'}</span>
                  </Link>
                  <span className="shrink-0 tabular-nums">{qty(item.cbm)} CBM</span>
                </li>
              ))}
            </ul>
          )}
          {overloaded && (
            <p className="mt-2 text-xs font-semibold text-[#ff8a94]">
              La carga supera la capacidad por {qty(Math.max(0, used - capacity))} CBM.
            </p>
          )}
        </div>

        <label className="flex flex-col gap-1 text-[11px] text-[#c5d4ea]">
          Probar un pedido (CBM)
          <input
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={openEnded ? 'Sin límite' : `hasta ${qty(remaining)}`}
            disabled={openEnded || overloaded || remaining <= 0}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-[#4d8dff] disabled:opacity-50"
          />
          {hasPreview && !openEnded && (
            <span className={fits ? 'text-[#86efac]' : 'text-[#ff8a94]'}>
              {fits
                ? `Cabe. Quedarían ${qty(remaining - preview)} CBM libres.`
                : `No cabe. Sobran ${qty(preview - remaining)} CBM.`}
            </span>
          )}
          {!hasPreview && !openEnded && remaining > 0 && !overloaded && (
            <span>Escribe el volumen y verás el bloque dentro del espacio libre.</span>
          )}
        </label>
      </div>
    </div>
  )
}
