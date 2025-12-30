import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, formatStr: string = 'PPP'): string {
  return format(parseISO(dateString), formatStr, { locale: fr });
}

export function formatTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm', { locale: fr });
}

export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return `Aujourd'hui à ${format(date, 'HH:mm')}`;
  }
  
  if (isTomorrow(date)) {
    return `Demain à ${format(date, 'HH:mm')}`;
  }
  
  return format(date, "EEEE d MMMM 'à' HH:mm", { locale: fr });
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}min`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    confirmed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-blue-500/20 text-blue-400',
    no_show: 'bg-gray-500/20 text-gray-400',
    sent: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Terminé',
    no_show: 'Absent',
    sent: 'Envoyé',
    failed: 'Échoué',
  };
  return labels[status] || status;
}

export function getNotificationTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    confirmation: '✉️',
    reminder: '⏰',
    followup: '📱',
    relaunch: '🔄',
    cancellation: '❌',
    modification: '✏️',
  };
  return icons[type] || '📧';
}

export function getChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    both: 'Email + SMS',
  };
  return labels[channel] || channel;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 15
): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }
  }
  
  return slots;
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

export function isDatePast(dateString: string): boolean {
  return isPast(parseISO(dateString));
}

export function isDateFuture(dateString: string): boolean {
  return isFuture(parseISO(dateString));
}
