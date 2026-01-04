import { supabase } from './supabase';

// Helper to simulate API response format expected by the frontend
const wrapResponse = (data: any, error: any = null) => {
  if (error) throw error;
  return { data };
};

// ============================================================================
// Auth (Géré principalement via useSupabaseAuthStore, mais on garde pour compatibilité)
// ============================================================================
export const authApi = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return wrapResponse(data, error);
  },
  register: async (data: any) => {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { ...data, role: 'professional' } } // Assumption
    });
    return wrapResponse(result, error);
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return wrapResponse(null, error);
  },
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return wrapResponse(user, error);
  },
  updateProfile: async (data: any) => {
    const { data: user, error } = await supabase.auth.updateUser({ data });
    return wrapResponse(user, error);
  },
  changePassword: async (password: string) => {
    const { data: user, error } = await supabase.auth.updateUser({ password });
    return wrapResponse(user, error);
  }
};

// ============================================================================
// Services
// ============================================================================
export const servicesApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('services').select('*');
    return wrapResponse(data, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  create: async (data: any) => {
    const { data: res, error } = await supabase.from('services').insert(data).select().single();
    return wrapResponse(res, error);
  },
  update: async (id: number, data: any) => {
    const { data: res, error } = await supabase.from('services').update(data).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    return wrapResponse(null, error);
  },
  publicList: async (professionalId: number) => {
    const { data, error } = await supabase.from('services').select('*').eq('professional_id', professionalId);
    return wrapResponse(data, error);
  },
};

// ============================================================================
// Disponibilités
// ============================================================================
export const availabilityApi = {
  list: async () => {
    const { data, error } = await supabase.from('availabilities').select('*');
    return wrapResponse(data, error);
  },
  update: async (data: any) => {
    // Logic depends on schema, assuming direct update for now
    const { data: res, error } = await supabase.from('availabilities').upsert(data).select();
    return wrapResponse(res, error);
  },
  exceptions: async () => {
    const { data, error } = await supabase.from('availability_exceptions').select('*');
    return wrapResponse(data, error);
  },
  addException: async (data: any) => {
    const { data: res, error } = await supabase.from('availability_exceptions').insert(data).select();
    return wrapResponse(res, error);
  },
  deleteException: async (id: number) => {
    const { error } = await supabase.from('availability_exceptions').delete().eq('id', id);
    return wrapResponse(null, error);
  },
  getSlots: async (params: any) => {
    // Complex logic usually roughly mocked or requires DB function
    // Returning empty for now to prevent crash
    console.warn('getSlots requires backend logic or DB function');
    return wrapResponse([]);
  },
  getAvailableDays: async (params: any) => {
    return wrapResponse([]);
  }
};

// ============================================================================
// Rendez-vous
// ============================================================================
export const appointmentsApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('appointments').select('*');
    return wrapResponse(data, error);
  },
  today: async () => {
    // Mocking 'today' logic
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('appointments').select('*').gte('start_time', today);
    return wrapResponse(data, error);
  },
  stats: async () => {
    const { count, error } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
    return wrapResponse({ total: count || 0 }, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  create: async (data: any) => {
    const { data: res, error } = await supabase.from('appointments').insert(data).select().single();
    return wrapResponse(res, error);
  },
  publicCreate: async (data: any) => {
    const { data: res, error } = await supabase.from('appointments').insert(data).select().single();
    return wrapResponse(res, error);
  },
  update: async (id: number, data: any) => {
    const { data: res, error } = await supabase.from('appointments').update(data).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  confirm: async (id: number) => {
    const { data: res, error } = await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  cancel: async (id: number, reason?: string) => {
    const { data: res, error } = await supabase.from('appointments').update({ status: 'cancelled', cancel_reason: reason }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  complete: async (id: number) => {
    const { data: res, error } = await supabase.from('appointments').update({ status: 'completed' }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  noShow: async (id: number) => {
    const { data: res, error } = await supabase.from('appointments').update({ status: 'no_show' }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
};

// ============================================================================
// Notifications
// ============================================================================
export const notificationsApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('notifications').select('*');
    return wrapResponse(data, error);
  },
  stats: async () => {
    const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    return wrapResponse({ total: count || 0, unread: 0 }, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('notifications').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  resend: async (id: number) => { return wrapResponse(true); }, // Mock
  cancel: async (id: number) => { return wrapResponse(true); }, // Mock
};

// ============================================================================
// Dashboard
// ============================================================================
export const dashboardApi = {
  professional: async () => { return wrapResponse({}); },
  client: async () => { return wrapResponse({}); },
  stats: async (period?: string) => { return wrapResponse({}); },
};

// ============================================================================
// API Immobilier
// ============================================================================

// Vendeurs
export const sellersApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('sellers').select('*');
    return wrapResponse(data, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('sellers').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  create: async (data: any) => {
    const { data: res, error } = await supabase.from('sellers').insert(data).select().single();
    return wrapResponse(res, error);
  },
  update: async (id: number, data: any) => {
    const { data: res, error } = await supabase.from('sellers').update(data).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    return wrapResponse(null, error);
  },
  archive: async (id: number) => {
    const { data: res, error } = await supabase.from('sellers').update({ status: 'archived' }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  stats: async () => {
    // Mock stats with just totals
    const { count: total, error: err1 } = await supabase.from('sellers').select('*', { count: 'exact', head: true });
    const { count: active, error: err2 } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'active');
    if (err1) throw err1;
    return wrapResponse({ total: total || 0, active: active || 0 });
  },
};

// Acheteurs
export const buyersApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('buyers').select('*');
    return wrapResponse(data, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('buyers').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  create: async (data: any) => {
    const { data: res, error } = await supabase.from('buyers').insert(data).select().single();
    return wrapResponse(res, error);
  },
  update: async (id: number, data: any) => {
    const { data: res, error } = await supabase.from('buyers').update(data).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('buyers').delete().eq('id', id);
    return wrapResponse(null, error);
  },
  archive: async (id: number) => {
    const { data: res, error } = await supabase.from('buyers').update({ status: 'archived' }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  addCriteria: async (id: number, data: any) => {
    // Assuming 'buyer_criteria' table
    const { data: res, error } = await supabase.from('buyer_criteria').insert({ ...data, buyer_id: id }).select();
    return wrapResponse(res, error);
  },
  updateCriteria: async (buyerId: number, criteriaId: number, data: any) => {
    const { data: res, error } = await supabase.from('buyer_criteria').update(data).eq('id', criteriaId).select();
    return wrapResponse(res, error);
  },
  deleteCriteria: async (buyerId: number, criteriaId: number) => {
    const { error } = await supabase.from('buyer_criteria').delete().eq('id', criteriaId);
    return wrapResponse(null, error);
  },
  stats: async () => {
    const { count: total, error: err1 } = await supabase.from('buyers').select('*', { count: 'exact', head: true });
    const { count: active, error: err2 } = await supabase.from('buyers').select('*', { count: 'exact', head: true }).eq('status', 'active');
    if (err1) throw err1;
    return wrapResponse({ total: total || 0, active: active || 0 });
  },
};

// Propriétés
export const propertiesApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('properties').select('*');
    return wrapResponse(data, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  create: async (data: any) => {
    const { data: res, error } = await supabase.from('properties').insert(data).select().single();
    return wrapResponse(res, error);
  },
  update: async (id: number, data: any) => {
    const { data: res, error } = await supabase.from('properties').update(data).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    return wrapResponse(null, error);
  },
  findBuyers: async (id: number) => {
    // Mock logic: returns empty list for now as matching logic is complex in SQL
    return wrapResponse([]);
  },
  markAsSold: async (id: number) => {
    const { data: res, error } = await supabase.from('properties').update({ status: 'sold' }).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  stats: async () => {
    const { count: total, error: err1 } = await supabase.from('properties').select('*', { count: 'exact', head: true });
    const { count: available, error: err2 } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: sold, error: err3 } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'sold');

    // Total value mock (requires sum query)
    const { data: valueData } = await supabase.from('properties').select('price');
    const total_value = valueData?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;

    if (err1) throw err1;
    return wrapResponse({ total: total || 0, available: available || 0, sold: sold || 0, total_value });
  },
};

// Matches
export const matchesApi = {
  list: async (params?: any) => {
    const { data, error } = await supabase.from('matches').select('*');
    return wrapResponse(data, error);
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('matches').select('*').eq('id', id).single();
    return wrapResponse(data, error);
  },
  pending: async () => {
    const { data, error } = await supabase.from('matches').select('*').eq('status', 'pending');
    return wrapResponse(data, error);
  },
  top: async () => {
    const { data, error } = await supabase.from('matches').select('*').gte('score', 80).limit(5);
    return wrapResponse(data, error);
  },
  updateStatus: async (id: number, data: any) => {
    const { data: res, error } = await supabase.from('matches').update(data).eq('id', id).select().single();
    return wrapResponse(res, error);
  },
  recalculate: async () => { return wrapResponse({ success: true }); },
  stats: async () => {
    const { count: total, error: err1 } = await supabase.from('matches').select('*', { count: 'exact', head: true });
    const { count: high_score, error: err2 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).gte('score', 80);
    const { count: pending, error: err3 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: interested, error: err4 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'interested');

    if (err1) throw err1;
    return wrapResponse({ total: total || 0, high_score: high_score || 0, pending: pending || 0, interested: interested || 0 });
  },
};

// Types de propriétés
export const propertyTypesApi = {
  list: async () => {
    //   const { data, error } = await supabase.from('property_types').select('*');
    //   return wrapResponse(data, error);
    // Mock static list if table doesn't exist
    return wrapResponse([
      { id: 1, label: 'Appartement' },
      { id: 2, label: 'Maison' },
      { id: 3, label: 'Terrain' }
    ]);
  },
};

// Settings
export const settingsApi = {
  get: async () => { return wrapResponse({}); },
  update: async (data: any) => { return wrapResponse({}); },
  resetTemplates: async () => { return wrapResponse({}); },
  templateVariables: async () => { return wrapResponse({}); },
};

export default {
  auth: authApi,
  services: servicesApi,
  availability: availabilityApi,
  appointments: appointmentsApi,
  notifications: notificationsApi,
  dashboard: dashboardApi,
  sellers: sellersApi,
  buyers: buyersApi,
  properties: propertiesApi,
  matches: matchesApi,
  propertyTypes: propertyTypesApi,
  settings: settingsApi
};
