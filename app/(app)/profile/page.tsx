'use client'

import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { ProfileCard } from '@/features/auth/components/profile-card'
import { PermissionsList } from '@/features/auth/components/permissions-list'
import { SessionsList } from '@/features/auth/components/sessions-list'

export default function ProfilePage() {
  const { user, error, loading } = useCurrentUser()

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Mi perfil</h1>
      </header>
      <div className="mx-auto max-w-3xl space-y-4 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}
        {user && (
          <>
            <ProfileCard user={user} />
            <SessionsList />
            <PermissionsList user={user} />
          </>
        )}
      </div>
    </main>
  )
}
