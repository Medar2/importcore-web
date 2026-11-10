'use client'

import { useState } from 'react'
import type { CurrentUser } from '@/features/auth/types'
import { PERM, can } from '@/features/auth/utils/permissions'
import { RoleCreateForm } from './role-create-form'
import { RolesList } from './roles-list'

export function RolesPagePanel({ me }: { me: CurrentUser }) {
  const [version, setVersion] = useState(0)
  const canCreate = can(me, PERM.ROLES_CREATE)

  return (
    <div className="space-y-4">
      {canCreate && <RoleCreateForm onCreated={() => setVersion((v) => v + 1)} />}
      <RolesList version={version} />
    </div>
  )
}
