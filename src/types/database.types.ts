// Types de base de données Supabase
// Ce fichier contient les types TypeScript pour votre schéma Supabase
// Vous pouvez générer automatiquement ces types avec: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Interface de base pour les tables
export interface Database {
  public: {
    Tables: {
      // Exemple: Table utilisateurs
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'admin' | 'agent' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role?: 'admin' | 'agent' | 'user';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: 'admin' | 'agent' | 'user';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Exemple: Table propriétés
      properties: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          address: string;
          city: string;
          postal_code: string | null;
          property_type: string;
          bedrooms: number | null;
          bathrooms: number | null;
          surface_area: number | null;
          status: 'available' | 'sold' | 'pending';
          agent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          address: string;
          city: string;
          postal_code?: string | null;
          property_type: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          surface_area?: number | null;
          status?: 'available' | 'sold' | 'pending';
          agent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          address?: string;
          city?: string;
          postal_code?: string | null;
          property_type?: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          surface_area?: number | null;
          status?: 'available' | 'sold' | 'pending';
          agent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Exemple: Table rendez-vous
      appointments: {
        Row: {
          id: string;
          property_id: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          appointment_date: string;
          status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
          notes: string | null;
          agent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          appointment_date: string;
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          agent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          appointment_date?: string;
          status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
          notes?: string | null;
          agent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      // Ajoutez vos vues ici si nécessaire
      [_ in never]: never;
    };
    Functions: {
      // Ajoutez vos fonctions Supabase ici si nécessaire
      [_ in never]: never;
    };
    Enums: {
      // Ajoutez vos enums ici si nécessaire
      [_ in never]: never;
    };
  };
}
