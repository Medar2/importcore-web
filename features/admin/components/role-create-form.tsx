'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { rolesAdminService } from '../services/roles-admin.service'

interface RoleCreateFormProps {
  onCreated?: () => void
}

export function RoleCreateForm({ onCreated }: RoleCreateFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const role = await rolesAdminService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      onCreated?.()
      setOpen(false)
      setName('')
      setDescription('')
      router.push(`/admin/roles/${role.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el rol')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 sm:w-auto sm:px-4"
      >
        <Plus className="size-4" />
        Nuevo rol
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">Crear rol</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del rol"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <p className="text-[11px] text-muted-foreground">Tras crearlo podrás asignar permisos en la matriz.</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Crear y configurar permisos
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
