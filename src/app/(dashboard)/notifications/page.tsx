'use client';

import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api';
import { NotificationItem } from '@/types';
import { Card, Button, Badge, Spinner, Select, Modal } from '@/components/ui';
import { formatDate, getChannelLabel, getNotificationTypeIcon, cn } from '@/lib/utils';
import { Bell, RefreshCw, Send, XCircle, Eye, Mail, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, [pagination.current_page, filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.list({
        page: pagination.current_page,
        type: filters.type || undefined,
        status: filters.status || undefined,
      });
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await notificationsApi.stats();
      setStats(response.data.stats);
    } catch (error) {
      console.error(error);
    }
  };

  const handleResend = async (notification: NotificationItem) => {
    try {
      await notificationsApi.resend(notification.id);
      toast.success('Notification renvoyée');
      loadNotifications();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleCancel = async (notification: NotificationItem) => {
    try {
      await notificationsApi.cancel(notification.id);
      toast.success('Notification annulée');
      loadNotifications();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const viewDetails = async (notification: NotificationItem) => {
    try {
      const response = await notificationsApi.get(notification.id);
      setSelectedNotification(response.data.notification);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-dark-400">Historique des notifications envoyées</p>
        </div>
        <Button variant="secondary" onClick={() => { loadNotifications(); loadStats(); }}>
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} icon={Bell} />
          <StatCard label="Envoyées" value={stats.sent} icon={Send} color="emerald" />
          <StatCard label="En attente" value={stats.pending} icon={Bell} color="amber" />
          <StatCard label="Échouées" value={stats.failed} icon={XCircle} color="red" />
        </div>
      )}

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPagination({ ...pagination, current_page: 1 }); }}
            options={[
              { value: '', label: 'Tous les types' },
              { value: 'confirmation', label: 'Confirmation' },
              { value: 'reminder', label: 'Rappel' },
              { value: 'followup', label: 'Suivi' },
              { value: 'relaunch', label: 'Relance' },
            ]}
            className="sm:w-48"
          />
          <Select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination({ ...pagination, current_page: 1 }); }}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'sent', label: 'Envoyée' },
              { value: 'failed', label: 'Échouée' },
              { value: 'cancelled', label: 'Annulée' },
            ]}
            className="sm:w-48"
          />
        </div>
      </Card>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <p className="text-dark-400">Aucune notification</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getNotificationTypeIcon(notification.type)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{notification.type_label}</span>
                      <Badge className={cn('status-' + notification.status)}>{notification.status}</Badge>
                      <Badge variant="default">
                        {notification.channel === 'email' ? <Mail className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                        {getChannelLabel(notification.channel)}
                      </Badge>
                    </div>
                    {notification.appointment && (
                      <p className="text-dark-400 text-sm">
                        {notification.appointment.client_name} - {notification.appointment.service_name}
                      </p>
                    )}
                    <p className="text-dark-500 text-xs mt-1">
                      Programmée: {formatDate(notification.scheduled_at, 'Pp')}
                      {notification.sent_at && ` • Envoyée: ${formatDate(notification.sent_at, 'Pp')}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => viewDetails(notification)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {notification.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => handleCancel(notification)}>
                      <XCircle className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                  {notification.can_retry && (
                    <Button variant="ghost" size="sm" onClick={() => handleResend(notification)}>
                      <RefreshCw className="w-4 h-4 text-primary-400" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={pagination.current_page === 1} onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-dark-400">Page {pagination.current_page} sur {pagination.last_page}</span>
          <Button variant="secondary" size="sm" disabled={pagination.current_page === pagination.last_page} onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal détail */}
      <Modal isOpen={!!selectedNotification} onClose={() => setSelectedNotification(null)} title="Détails de la notification">
        {selectedNotification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-dark-400 text-sm">Type</p><p className="text-white">{selectedNotification.type_label}</p></div>
              <div><p className="text-dark-400 text-sm">Canal</p><p className="text-white">{getChannelLabel(selectedNotification.channel)}</p></div>
              <div><p className="text-dark-400 text-sm">Statut</p><Badge className={`status-${selectedNotification.status}`}>{selectedNotification.status}</Badge></div>
              <div><p className="text-dark-400 text-sm">Tentatives</p><p className="text-white">{selectedNotification.retry_count || 0}</p></div>
            </div>
            {selectedNotification.content && (
              <div>
                <p className="text-dark-400 text-sm mb-1">Contenu</p>
                <div className="p-3 bg-dark-900 rounded-lg text-sm text-dark-300 whitespace-pre-wrap">{selectedNotification.content}</div>
              </div>
            )}
            {selectedNotification.error_message && (
              <div>
                <p className="text-dark-400 text-sm mb-1">Erreur</p>
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-sm text-red-400">{selectedNotification.error_message}</div>
              </div>
            )}
            {selectedNotification.logs && selectedNotification.logs.length > 0 && (
              <div>
                <p className="text-dark-400 text-sm mb-2">Historique</p>
                <div className="space-y-2">
                  {selectedNotification.logs.map((log, index) => (
                    <div key={index} className="p-2 bg-dark-900 rounded text-sm">
                      <span className="text-primary-400">{log.action}</span>
                      <span className="text-dark-500 ml-2">{formatDate(log.created_at, 'Pp')}</span>
                      {log.details && <p className="text-dark-400 mt-1">{log.details}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button variant="secondary" onClick={() => setSelectedNotification(null)} className="w-full">Fermer</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'blue' }: { label: string; value: number; icon: any; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
  };
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', colors[color])}><Icon className="w-5 h-5" /></div>
      </div>
    </Card>
  );
}
