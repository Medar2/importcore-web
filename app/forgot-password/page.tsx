'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PackageSearch, Loader2, ArrowLeft, MailCheck, AlertCircle } from 'lucide-react'
import { requestPasswordReset } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al procesar tu solicitud',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-primary p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PackageSearch className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ImportCore RD</h1>
          <p className="text-xs text-muted-foreground">
            Recuperación de contraseña
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <MailCheck className="size-6" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Revisa tu bandeja de entrada
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Si el correo{' '}
              <strong className="text-foreground">{email}</strong> está
              asociado a una cuenta activa, te hemos enviado un enlace profesional
              para restablecer tu contraseña.
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              ⏱️ El enlace es válido durante <strong>2 horas</strong>. Revisa
              también tu carpeta de correo no deseado (spam).
            </p>

            <div className="mt-6 flex w-full flex-col gap-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Volver al inicio de sesión
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setError(null)
                }}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                ¿No recibiste el correo? Intentar nuevamente
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Ingresa el correo electrónico vinculado a tu cuenta para recibir
              un enlace seguro de restablecimiento.
            </p>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Email registrado</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="usuario@importcore.local"
              />
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
              {loading ? 'Enviando enlace…' : 'Enviar enlace de recuperación'}
            </button>

            <div className="mt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                <span>Volver al inicio de sesión</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
