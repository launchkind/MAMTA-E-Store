import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { READ_ONLY_USERS } from '@/lib/readOnlyConfig'

export type AdminUser = {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  employee_role: string | null
}

type AuthState = {
  user: AdminUser | null
  session: Session | null
  isAuthenticated: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  logout: () => Promise<void>
  setSession: (session: Session | null) => Promise<void>

  // Role helpers (same API as before so all components work unchanged)
  checkIsAdmin: () => boolean
  canPerformCRUD: () => boolean
  isReadOnly: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,

      setSession: async (session) => {
        if (!session) {
          set({ user: null, session: null, isAuthenticated: false })
          return
        }

        const { data: profile } = await supabase
          .from('users')
          .select('id, name, email, avatar, role, employee_role')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          // Only admin and employee can access the admin dashboard
          if (profile.role !== 'admin' && profile.role !== 'employee') {
            await supabase.auth.signOut()
            set({ user: null, session: null, isAuthenticated: false })
            return
          }
          set({ user: profile as AdminUser, session, isAuthenticated: true })
        }
      },

      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
        // onAuthStateChange fires → setSession called automatically
      },

      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw new Error(error.message)
      },

      loginWithGitHub: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw new Error(error.message)
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, isAuthenticated: false })
      },

      checkIsAdmin: () => get().user?.role === 'admin',

      canPerformCRUD: () => {
        const { user } = get()
        if (!user) return false
        if (READ_ONLY_USERS.includes(user.email.toLowerCase())) return false
        return user.role === 'admin'
      },

      isReadOnly: () => {
        const { user } = get()
        if (!user) return true
        return READ_ONLY_USERS.includes(user.email.toLowerCase())
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({
        user: s.user,
        session: s.session,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore

// Call once in main.tsx — keeps Supabase session in sync with Zustand store
export function initAuthListener() {
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session)
  })
}
