'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  PackageSearch,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react'
import { resetPasswordConfirm } from '@/lib/api'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Enlace incompleto o inválido
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          No se encontró el token de seguridad necesario para restablecer la
          contraseña. Por favor solicita un nuevo enlace de recuperación.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await resetPasswordConfirm(token!, newPassword)
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al restablecer la contraseña',
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          ¡Contraseña actualizada con éxito!
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Tu contraseña ha sido restablecida. Hemos enviado un correo de
          confirmación a tu bandeja de entrada y finalizado todas las sesiones
          anteriores por seguridad.
        </p>
        <Link
          href="/login"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Iniciar sesión ahora
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Crea una contraseña segura para tu cuenta de al menos 6 caracteres.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Nueva contraseña</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Confirmar contraseña</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Repite la nueva contraseña"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="size-4 opacity-50" />
          </div>
        </div>
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {loading ? 'Actualizando contraseña…' : 'Aplicar cambio de contraseña'}
      </button>

      <div className="mt-2 text-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Cancelar y volver al inicio de sesión
        </Link>
      </div>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-primary p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PackageSearch className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ImportCore RD</h1>
          <p className="text-xs text-muted-foreground">
            Restablecer contraseña
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Cargando…
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
