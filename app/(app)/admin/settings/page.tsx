'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { settingsService } from '@/features/admin/services/settings.service'
import { SettingRow } from '@/features/admin/components/setting-row'
import { GROUP_LABELS, groupSettings } from '@/features/admin/known-settings'
import type { SystemSetting } from '@/features/admin/types'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM, can } from '@/features/auth/utils/permissions'

function SettingsEditor({ canEdit }: { canEdit: boolean }) {
  const [settings, setSettings] = useState<SystemSetting[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    settingsService.list().then(setSettings).catch((e: Error) => setError(e.message))
  }, [])

  const groups = useMemo(() => groupSettings(settings ?? []), [settings])

  function onSaved(s: SystemSetting) {
    setSettings((list) => {
      const rest = (list ?? []).filter((x) => x.key !== s.key)
      return [...rest, s]
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      {!canEdit && (
        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          Solo lectura: tu rol no tiene CONFIGURACION.SISTEMA.EDITAR.
        </p>
      )}
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {!settings && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando…
        </p>
      )}
      {settings &&
        groups.map(([group, items]) => (
          <section key={group} className="rounded-2xl border border-border bg-card px-5 py-3">
            <h2 className="pt-1 text-sm font-semibold">{GROUP_LABELS[group] ?? group}</h2>
            <ul className="divide-y divide-border">
              {items.map((s) => (
                <SettingRow key={s.key} setting={s} canEdit={canEdit} onSaved={onSaved} />
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Configuración del sistema</h1>
      </header>
      <PermissionGate anyOf={[PERM.SETTINGS_VIEW]}>
        {(me) => <SettingsEditor canEdit={can(me, PERM.SETTINGS_EDIT)} />}
      </PermissionGate>
    </main>
  )
}
