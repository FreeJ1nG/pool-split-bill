import { createStore } from 'zustand'

import type { User } from '~/schemas/auth.ts'

export interface AuthStoreState {
  user?: User
}

export interface AuthStoreActions {
  setUser: (user?: User) => void
}

export type AuthStore = AuthStoreState & AuthStoreActions

export const defaultInitState: AuthStoreState = {
  user: undefined,
}

export const createAuthStore = (
  initState: AuthStoreState = defaultInitState,
) => {
  return createStore<AuthStore>()(set => ({
    ...initState,
    setUser: user => set(state => ({ ...state, user })),
  }))
}
