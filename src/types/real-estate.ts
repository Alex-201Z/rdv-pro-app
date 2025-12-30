// ============================================================================
// Types TypeScript pour le CRM Immobilier
// ============================================================================

export interface Seller {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  status: 'active' | 'archived';
  project_start_date?: string;
  open_to_offmarket: boolean;
  properties?: Property[];
  created_at: string;
}

export interface PropertyType {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Property {
  id: number;
  seller_id: number;
  seller?: Seller;
  property_type_id: number;
  property_type?: PropertyType;
  title: string;
  description?: string;
  address: string;
  city: string;
  postal_code: string;
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  elevator: boolean;
  parking: boolean;
  terrace: boolean;
  garden: boolean;
  year_built?: number;
  price: number;
  formatted_price: string;
  agency_fees?: number;
  status: 'available' | 'under_offer' | 'sold' | 'archived';
  available_from?: string;
  photos?: string[];
  featured_photo?: string;
  documents?: string[];
  matches?: Match[];
  // Commission fields
  commission_percentage?: number;
  entered_by_professional: boolean;
  sold_by_professional: boolean;
  calculated_agency_fees?: number;
  net_seller?: number;
  professional_commission?: number;
  professional_commission_rate: number;
  formatted_agency_fees?: string;
  formatted_net_seller?: string;
  formatted_professional_commission?: string;
  // Pipeline dates
  registration_date?: string;
  first_estimate_date?: string;
  estimate_delivery_date?: string;
  mandate_signature_date?: string;
  offer_received_date?: string;
  buyer_offer_name?: string;
  sales_agreement_date?: string;
  authentic_deed_date?: string;
  keys_handover_date?: string;
  created_at: string;
}

export interface Buyer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
  status: 'active' | 'archived';
  criteria?: BuyerCriteria[];
  matches?: Match[];
  created_at: string;
}

export interface BuyerCriteria {
  id: number;
  buyer_id: number;
  buyer?: Buyer;
  property_type_id: number;
  property_type?: PropertyType;
  cities?: string[];
  postal_codes?: string[];
  budget_min: number;
  budget_max: number;
  formatted_budget: string;
  surface_min?: number;
  surface_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  elevator_required: boolean;
  parking_required: boolean;
  terrace_preferred: boolean;
  garden_preferred: boolean;
  priority: 1 | 2 | 3;
  is_active: boolean;
  created_at: string;
}

export interface Match {
  id: number;
  property_id: number;
  property?: Property;
  buyer_id: number;
  buyer?: Buyer;
  buyer_criteria_id: number;
  buyer_criteria?: BuyerCriteria;
  match_score: number;
  match_details: any;
  status:
    | 'pending'
    | 'contacted'
    | 'interested'
    | 'visit_scheduled'
    | 'visited'
    | 'not_interested'
    | 'offer_made'
    | 'sold';
  buyer_notified: boolean;
  notified_at?: string;
  notes?: string;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Form Types
export interface SellerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  project_start_date?: string;
  open_to_offmarket?: boolean;
}

export interface BuyerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface PropertyFormData {
  seller_id: number;
  property_type_id: number;
  title: string;
  description?: string;
  address: string;
  city: string;
  postal_code: string;
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  elevator: boolean;
  parking: boolean;
  terrace: boolean;
  garden: boolean;
  year_built?: number;
  price: number;
  agency_fees?: number;
  photos?: string[];
  documents?: string[];
  // Commission fields
  commission_percentage?: number;
  entered_by_professional?: boolean;
  sold_by_professional?: boolean;
  // Pipeline dates
  registration_date?: string;
  first_estimate_date?: string;
  estimate_delivery_date?: string;
  mandate_signature_date?: string;
  offer_received_date?: string;
  buyer_offer_name?: string;
  sales_agreement_date?: string;
  authentic_deed_date?: string;
  keys_handover_date?: string;
}

export interface BuyerCriteriaFormData {
  property_type_id: number;
  cities?: string[];
  postal_codes?: string[];
  budget_min: number;
  budget_max: number;
  surface_min?: number;
  surface_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  elevator_required: boolean;
  parking_required: boolean;
  terrace_preferred: boolean;
  garden_preferred: boolean;
  priority?: 1 | 2 | 3;
}

// Dashboard Stats
export interface RealEstateDashboardStats {
  properties_available: number;
  properties_sold_this_month: number;
  sellers_active: number;
  buyers_active: number;
  matches_pending: number;
  visits_upcoming: number;
  top_matches: Match[];
  recent_properties: Property[];
}
