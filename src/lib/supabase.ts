import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies'
  );
}

// Création du client Supabase réutilisable
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Types d'authentification
export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
};

// Fonctions utilitaires pour l'authentification
export const authHelpers = {
  // Connexion avec email et mot de passe
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Inscription
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Récupérer la session actuelle
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Réinitialiser le mot de passe
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  // Mettre à jour le mot de passe
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Écouter les changements d'authentification
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Fonctions utilitaires pour la base de données
export const dbHelpers = {
  // Récupérer tous les enregistrements d'une table
  getAll: async <T>(table: string) => {
    const { data, error } = await supabase.from(table).select('*');
    return { data: data as T[] | null, error };
  },

  // Récupérer un enregistrement par ID
  getById: async <T>(table: string, id: string | number) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as T | null, error };
  },

  // Créer un nouvel enregistrement
  create: async <T>(table: string, values: any) => {
    const { data, error } = await supabase
      .from(table)
      .insert(values)
      .select()
      .single();
    return { data: data as T | null, error };
  },

  // Mettre à jour un enregistrement
  update: async <T>(table: string, id: string | number, values: any) => {
    const { data, error } = await supabase
      .from(table)
      .update(values)
      .eq('id', id)
      .select()
      .single();
    return { data: data as T | null, error };
  },

  // Supprimer un enregistrement
  delete: async (table: string, id: string | number) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  },

  // Requête personnalisée avec filtres
  query: async <T>(
    table: string,
    options?: {
      select?: string;
      filters?: { column: string; operator: string; value: any }[];
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ) => {
    let query = supabase.from(table).select(options?.select || '*');

    // Appliquer les filtres
    if (options?.filters) {
      options.filters.forEach((filter) => {
        query = query.filter(filter.column, filter.operator, filter.value);
      });
    }

    // Appliquer le tri
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Appliquer la limite
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    return { data: data as T[] | null, error };
  },
};

// Fonctions utilitaires pour le stockage de fichiers
export const storageHelpers = {
  // Uploader un fichier
  uploadFile: async (
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);
    return { data, error };
  },

  // Récupérer l'URL publique d'un fichier
  getPublicUrl: (bucket: string, path: string) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },

  // Supprimer un fichier
  deleteFile: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  },

  // Lister les fichiers d'un dossier
  listFiles: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage.from(bucket).list(path);
    return { data, error };
  },
};

export default supabase;
