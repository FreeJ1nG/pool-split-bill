import { createContext, type ReactNode, useContext, useRef } from 'react'
import { useStore } from 'zustand'

import type { User } from '~/schemas/auth.ts'
import type { AuthStore } from '~/store/auth.ts'
import { createAuthStore } from '~/store/auth.ts'

export type AuthStoreApi = ReturnType<typeof createAuthStore>

export const AuthStoreContext = createContext<AuthStoreApi | undefined>(
  undefined,
)

export interface AuthStoreProviderProps {
  children: ReactNode
  userData?: User
}

export function AuthStoreProvider({
  children,
  userData,
}: AuthStoreProviderProps) {
  const storeRef = useRef<AuthStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createAuthStore({ user: userData })
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  )
}

// For some reason, @stylistic doesn't understand that generics need to have the trailling comma
// eslint-disable-next-line @stylistic/comma-dangle
export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const authStoreContext = useContext(AuthStoreContext)

  if (!authStoreContext)
    throw new Error('useAuthStore must be used within AuthStoreProvider')

  return useStore(authStoreContext, selector)
}
