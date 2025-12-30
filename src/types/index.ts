export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  role: 'admin' | 'professional' | 'client';
  avatar: string | null;
  sms_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  formatted_duration: string;
  price: number;
  formatted_price: string;
  color: string;
  buffer_before: number;
  buffer_after: number;
  total_duration: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  reference: string;
  start_time: string;
  end_time: string;
  formatted_date: string;
  formatted_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  status_label: string;
  status_color: string;
  price: number;
  formatted_price: string;
  notes: string | null;
  professional_notes: string | null;
  can_be_cancelled: boolean;
  is_upcoming: boolean;
  is_past: boolean;
  service: {
    id: number;
    name: string;
    duration: number;
    formatted_duration: string;
    color: string;
  } | null;
  client: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  professional: {
    id: number;
    full_name: string;
    company_name: string | null;
  } | null;
  notifications?: NotificationItem[];
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
}

export interface NotificationItem {
  id: number;
  type: 'confirmation' | 'reminder' | 'followup' | 'relaunch' | 'cancellation' | 'modification';
  type_label: string;
  channel: 'email' | 'sms' | 'both';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  scheduled_at: string;
  sent_at: string | null;
  can_retry: boolean;
  appointment?: {
    id: number;
    reference: string;
    start_time: string;
    service_name: string;
    client_name: string;
  };
  content?: string;
  error_message?: string;
  retry_count?: number;
  logs?: NotificationLog[];
}

export interface NotificationLog {
  action: string;
  details: string;
  created_at: string;
}

export interface Availability {
  day: number;
  day_name: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id?: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface AvailabilityException {
  id: number;
  date: string;
  formatted_date: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  reason: string | null;
  is_full_day: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  datetime: string;
}

export interface AvailableDay {
  date: string;
  formatted: string;
  slots_count: number;
}

export interface ProfessionalSettings {
  reminder_hours_before: number;
  followup_hours_after: number;
  relaunch_days_after: number;
  confirmation_email_template: string;
  reminder_email_template: string;
  reminder_sms_template: string;
  followup_sms_template: string;
  relaunch_email_template: string;
  min_booking_notice: number;
  max_booking_days: number;
  allow_cancellation: boolean;
  cancellation_notice: number;
  timezone: string;
  booking_page_slug: string | null;
  booking_page_description: string | null;
}

export interface DashboardStats {
  this_month: {
    appointments: number;
    revenue: number;
  };
  changes: {
    appointments: number;
    revenue: number;
  };
  today_count: number;
  upcoming_count: number;
  clients_count: number;
}

export interface ChartData {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  no_show: number;
  revenue: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
