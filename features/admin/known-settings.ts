import type { SystemSetting } from './types'

export const GROUP_LABELS: Record<string, string> = {
  FISCAL: 'Empresa / Fiscal (DGII)',
  EMAIL: 'Correo (SMTP)',
  VALIDATION: 'Validaciones',
  general: 'General',
}

/** Claves que ImportCore usa aunque todavía no existan en la base. */
const KNOWN: Omit<SystemSetting, 'value' | 'hasValue'>[] = [
  {
    key: 'FISCAL.COMPANY_RNC',
    description: 'RNC del emisor en e-CF y reportes 606/607/608',
    group: 'FISCAL',
    isSecret: false,
  },
  {
    key: 'FISCAL.COMPANY_NAME',
    description: 'Razón social del emisor',
    group: 'FISCAL',
    isSecret: false,
  },
]

const GROUP_ORDER = ['FISCAL', 'EMAIL', 'VALIDATION']

/** Une lo guardado con las claves conocidas y agrupa en orden estable. */
export function groupSettings(saved: SystemSetting[]): [string, SystemSetting[]][] {
  const byKey = new Map(saved.map((s) => [s.key, s]))
  for (const k of KNOWN) {
    if (!byKey.has(k.key)) byKey.set(k.key, { ...k, value: '', hasValue: false })
  }
  const groups = new Map<string, SystemSetting[]>()
  for (const s of byKey.values()) {
    const g = s.group || 'general'
    groups.set(g, [...(groups.get(g) ?? []), s])
  }
  const rank = (g: string) => (GROUP_ORDER.includes(g) ? GROUP_ORDER.indexOf(g) : GROUP_ORDER.length)
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([g, items]) => [g, items.sort((a, b) => a.key.localeCompare(b.key))])
}
