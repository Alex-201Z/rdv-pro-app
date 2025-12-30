import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authHelpers } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface SupabaseAuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, metadata?: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useSupabaseAuthStore = create<SupabaseAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await authHelpers.signIn(email, password);

          if (error) {
            set({
              isLoading: false,
              error: error.message,
              isAuthenticated: false
            });
            throw error;
          }

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erreur lors de la connexion',
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (email: string, password: string, metadata?: any) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await authHelpers.signUp(email, password, metadata);

          if (error) {
            set({
              isLoading: false,
              error: error.message,
              isAuthenticated: false
            });
            throw error;
          }

          // Note: Supabase peut nécessiter une confirmation par email
          // Dans ce cas, data.session sera null
          if (data.session) {
            set({
              user: data.user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: data.user,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Veuillez vérifier votre email pour confirmer votre inscription',
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erreur lors de l\'inscription',
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await authHelpers.signOut();

          if (error) {
            console.error('Erreur lors de la déconnexion:', error);
          }

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Erreur lors de la déconnexion:', error);
          // Même en cas d'erreur, on déconnecte localement
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchSession: async () => {
        set({ isLoading: true, error: null });
        try {
          const { session, error } = await authHelpers.getSession();

          if (error) {
            throw error;
          }

          if (session) {
            const { user, error: userError } = await authHelpers.getCurrentUser();

            if (userError) {
              throw userError;
            }

            set({
              user: user,
              session: session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Erreur lors de la récupération de la session',
          });
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await authHelpers.resetPassword(email);

          if (error) {
            set({
              isLoading: false,
              error: error.message
            });
            throw error;
          }

          set({
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erreur lors de la réinitialisation du mot de passe'
          });
          throw error;
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await authHelpers.updatePassword(newPassword);

          if (error) {
            set({
              isLoading: false,
              error: error.message
            });
            throw error;
          }

          set({
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erreur lors de la mise à jour du mot de passe'
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'supabase-auth-storage',
      // On ne persiste que les données non sensibles
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Initialiser l'écoute des changements d'authentification
authHelpers.onAuthStateChange((event, session) => {
  const store = useSupabaseAuthStore.getState();

  if (event === 'SIGNED_IN' && session) {
    useSupabaseAuthStore.setState({
      user: session.user,
      session: session,
      isAuthenticated: true,
      error: null,
    });
  } else if (event === 'SIGNED_OUT') {
    useSupabaseAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
    });
  } else if (event === 'TOKEN_REFRESHED' && session) {
    useSupabaseAuthStore.setState({
      user: session.user,
      session: session,
      isAuthenticated: true,
    });
  } else if (event === 'USER_UPDATED' && session) {
    useSupabaseAuthStore.setState({
      user: session.user,
      session: session,
    });
  }
});
