'use client'

import { useState } from 'react'
import { Check, Loader2, Lock } from 'lucide-react'
import { settingsService } from '../services/settings.service'
import type { SystemSetting } from '../types'

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-70'

interface SettingRowProps {
  setting: SystemSetting
  canEdit: boolean
  onSaved: (s: SystemSetting) => void
}

export function SettingRow({ setting, canEdit, onSaved }: SettingRowProps) {
  const initial = setting.isSecret ? '' : setting.value
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isBool = !setting.isSecret && (setting.value === 'true' || setting.value === 'false')
  const dirty = setting.isSecret ? value !== '' : value !== initial

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await settingsService.save(setting.key, {
        value,
        description: setting.description,
        group: setting.group,
      })
      onSaved(res)
      if (setting.isSecret) setValue('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="py-3">
      <label htmlFor={setting.key} className="flex items-center gap-1.5 font-mono text-xs font-semibold">
        {setting.isSecret && <Lock className="size-3 text-muted-foreground" />}
        {setting.key}
      </label>
      {setting.description && <p className="mt-0.5 text-xs text-muted-foreground">{setting.description}</p>}
      <div className="mt-2 flex gap-2">
        {isBool ? (
          <select
            id={setting.key}
            value={value}
            disabled={!canEdit}
            onChange={(e) => setValue(e.target.value)}
            className={inputCls}
          >
            <option value="true">Sí (true)</option>
            <option value="false">No (false)</option>
          </select>
        ) : (
          <input
            id={setting.key}
            type={setting.isSecret ? 'password' : 'text'}
            autoComplete={setting.isSecret ? 'new-password' : 'off'}
            value={value}
            disabled={!canEdit}
            placeholder={setting.isSecret ? (setting.hasValue ? 'Guardado · escribe para reemplazar' : 'Sin valor') : 'Sin valor'}
            onChange={(e) => setValue(e.target.value)}
            className={inputCls}
          />
        )}
        {canEdit && (
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
            {saved ? 'Listo' : 'Guardar'}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </li>
  )
}
