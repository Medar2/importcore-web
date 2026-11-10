'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, getToken } from '@/lib/api'
import { MODULES, type ModuleStat } from '@/features/dashboard/modules'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { DashboardSummary } from '@/features/dashboard/components/dashboard-summary'
import { ModuleGrid } from '@/features/dashboard/components/module-grid'
import { ProjectProgress } from '@/features/dashboard/components/project-progress'
import { AdminShortcuts } from '@/features/dashboard/components/admin-shortcuts'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Record<string, ModuleStat>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async () => {
    if (!getToken()) {
      router.replace('/login')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await Promise.allSettled(
        MODULES.map(async (m) => {
          const data = await apiGet<unknown>(m.endpoint)
          return [m.href, Array.isArray(data) ? data.length : null] as const
        }),
      )

      const next: Record<string, ModuleStat> = {}
      let failed = 0

      MODULES.forEach((m, i) => {
        const result = results[i]
        if (result.status === 'fulfilled') {
          next[m.href] = { count: result.value[1], ok: true }
        } else {
          failed += 1
          next[m.href] = { count: null, ok: false }
        }
      })

      setStats(next)
      setError(
        failed === 0
          ? null
          : failed === MODULES.length
            ? 'API no disponible — verifica que importcore-api esté corriendo'
            : `${failed} módulo(s) no respondieron; mostrando datos parciales.`,
      )
      setUpdatedAt(new Date())
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const statsValues = useMemo(() => Object.values(stats), [stats])
  const totalRecords = statsValues.reduce((sum, s) => sum + (s.count ?? 0), 0)
  const modulesWithData = statsValues.filter(
    (s) => s.ok && (s.count ?? 0) > 0,
  ).length
  const failedCount = statsValues.filter((s) => !s.ok).length

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('es-DO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  )
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="min-h-dvh bg-background">
      <DashboardHeader
        dateLabel={dateLabel}
        refreshing={loading}
        onRefresh={() => void load()}
      />

      <DashboardSummary
        loading={loading}
        totalRecords={totalRecords}
        modulesWithData={modulesWithData}
        modulesTotal={MODULES.length}
        failedCount={failedCount}
        updatedLabel={updatedLabel}
      />

      <main className="mx-auto max-w-6xl px-4 pb-10">
        {error && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <ModuleGrid stats={stats} loading={loading} />
        <AdminShortcuts />
        <ProjectProgress />
      </main>
    </div>
  )
}
