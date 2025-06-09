//..app/context/UserContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface UserContextType {
  role: string | null
  orgId: number | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  role: null,
  orgId: null,
  loading: true,
})

export const useUserContext = () => useContext(UserContext)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('role, organization_id')
        .eq('auth_id', user.id)
        .single()

      if (!error && data) {
        setRole(data.role)
        setOrgId(data.organization_id)
      }

      setLoading(false)
    }

    fetchUserRole()
  }, [])

  return (
    <UserContext.Provider value={{ role, orgId, loading }}>
      {children}
    </UserContext.Provider>
  )
}
