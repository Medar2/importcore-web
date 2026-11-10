'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { currentPeriod, fiscalService } from '@/features/fiscal/services/fiscal.service'
import type { FiscalCatalogs } from '@/features/fiscal/types'
import { DocumentsTab } from '@/features/fiscal/components/documents-tab'
import { PurchasesTab } from '@/features/fiscal/components/purchases-tab'
import { ReportsTab } from '@/features/fiscal/components/reports-tab'
import { SequencesTab } from '@/features/fiscal/components/sequences-tab'

const TABS = [
  { id: 'documents', label: 'Comprobantes' },
  { id: 'purchases', label: 'Compras (606)' },
  { id: 'reports', label: 'Reportes' },
  { id: 'sequences', label: 'Secuencias' },
] as const
type TabId = (typeof TABS)[number]['id']

export default function FiscalPage() {
  const [tab, setTab] = useState<TabId>('documents')
  const [period, setPeriod] = useState(currentPeriod)
  const [catalogs, setCatalogs] = useState<FiscalCatalogs | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fiscalService.catalogs().then(setCatalogs).catch((e) => setError(e.message))
  }, [])

  const shared = { catalogs, onError: setError }
  const periodProps = { period, onPeriodChange: setPeriod }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 pt-3">
        <h1 className="font-bold">Fiscal DGII</h1>
        <nav className="-mx-1 mt-2 flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(null) }}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2 text-sm font-medium',
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {tab === 'documents' && <DocumentsTab {...shared} {...periodProps} />}
        {tab === 'purchases' && <PurchasesTab {...shared} {...periodProps} />}
        {tab === 'reports' && <ReportsTab onError={setError} {...periodProps} />}
        {tab === 'sequences' && <SequencesTab {...shared} />}
      </div>
    </main>
  )
}
