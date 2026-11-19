'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, getToken } from '@/lib/api'
import { MODULES, type ModuleStat } from '@/features/dashboard/modules'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { can } from '@/features/auth/utils/permissions'
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header'
import { DashboardSummary } from '@/features/dashboard/components/dashboard-summary'
import { ModuleGrid } from '@/features/dashboard/components/module-grid'
import { ProjectProgress } from '@/features/dashboard/components/project-progress'
import { AdminShortcuts } from '@/features/dashboard/components/admin-shortcuts'

function recordCount(data: unknown): number | null {
  if (Array.isArray(data)) return data.length
  if (
    data &&
    typeof data === 'object' &&
    'total' in data &&
    typeof (data as { total: unknown }).total === 'number'
  ) {
    return (data as { total: number }).total
  }
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Record<string, ModuleStat>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const { user, loading: userLoading } = useCurrentUser()
  const visibleModules = useMemo(
    () => MODULES.filter((m) => !m.permission || can(user, m.permission)),
    [user],
  )

  const load = useCallback(async () => {
    if (!getToken()) {
      router.replace('/login')
      setLoading(false)
      return
    }
    if (userLoading) return

    setLoading(true)
    setError(null)

    try {
      const results = await Promise.allSettled(
        visibleModules.map(async (m) => {
          const data = await apiGet<unknown>(m.endpoint)
          return [m.href, recordCount(data)] as const
        }),
      )

      const next: Record<string, ModuleStat> = {}
      let failed = 0

      visibleModules.forEach((m, i) => {
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
          : failed === visibleModules.length
            ? 'API no disponible — verifica que importcore-api esté corriendo'
            : `${failed} módulo(s) no respondieron; mostrando datos parciales.`,
      )
      setUpdatedAt(new Date())
    } finally {
      setLoading(false)
    }
  }, [router, userLoading, visibleModules])

  useEffect(() => {
    void load()
  }, [load])

  const statsValues = useMemo(() => Object.values(stats), [stats])
  const totalRecords = statsValues.reduce((sum, s) => sum + (s.count ?? 0), 0)
  const modulesWithData = statsValues.filter(
    (s) => s.ok && (s.count ?? 0) > 0,
  ).length
  const failedCount = statsValues.filter((s) => !s.ok).length

  const [dateLabel, setDateLabel] = useState('')

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString('es-DO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    )
  }, [])
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="min-h-dvh bg-[#f3f5f8] text-[#23232C]">
      <DashboardHeader
        dateLabel={dateLabel}
        refreshing={loading}
        onRefresh={() => void load()}
      />

      <DashboardSummary
        loading={loading}
        totalRecords={totalRecords}
        modulesWithData={modulesWithData}
        modulesTotal={visibleModules.length}
        failedCount={failedCount}
        updatedLabel={updatedLabel}
      />

      <main className="mx-auto max-w-6xl px-4 pb-10">
        {error && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <ModuleGrid stats={stats} loading={loading} modules={visibleModules} />
        <AdminShortcuts />
        <ProjectProgress />
      </main>
    </div>
  )
}
