import { apiGet, apiPost } from '@/lib/api'
import type { AgingReport, ReminderRunResult } from '../types'

export const receivablesService = {
  aging: () => apiGet<AgingReport>('/receivables/aging'),
  runReminders: () => apiPost<ReminderRunResult>('/receivables/reminders/run'),
}
