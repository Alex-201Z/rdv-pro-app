'use client';

import { useEffect, useState } from 'react';
import { appointmentsApi } from '@/lib/api';
import { Appointment } from '@/types';
import { Card, Button, Badge, Modal, Input, Textarea, Spinner, Select } from '@/components/ui';
import { formatRelativeDate, formatDate, cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelModal, setCancelModal] = useState<{ open: boolean; appointment: Appointment | null }>({
    open: false,
    appointment: null,
  });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [pagination.current_page, filters.status]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.list({
        page: pagination.current_page,
        status: filters.status || undefined,
      });
      console.log('Appointments API response:', response); // DEBUG

      if (!response || !response.data) {
        console.error('Invalid response structure:', response);
        throw new Error('Réponse invalide du serveur');
      }

      setAppointments(response.data.appointments || []);

      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        console.warn('Missing pagination in response:', response.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appointment: Appointment, action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await appointmentsApi.confirm(appointment.id);
          toast.success('Rendez-vous confirmé');
          break;
        case 'complete':
          await appointmentsApi.complete(appointment.id);
          toast.success('Rendez-vous terminé');
          break;
        case 'no-show':
          await appointmentsApi.noShow(appointment.id);
          toast.success('Client marqué comme absent');
          break;
        case 'cancel':
          setCancelModal({ open: true, appointment });
          return;
        case 'view':
          const response = await appointmentsApi.get(appointment.id);
          setSelectedAppointment(response.data.appointment);
          return;
      }
      loadAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleCancel = async () => {
    if (!cancelModal.appointment) return;

    try {
      await appointmentsApi.cancel(cancelModal.appointment.id, cancelReason);
      toast.success('Rendez-vous annulé');
      setCancelModal({ open: false, appointment: null });
      setCancelReason('');
      loadAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rendez-vous</h1>
          <p className="text-dark-400">Gérez tous vos rendez-vous</p>
        </div>
        <Link href="/appointments/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouveau rendez-vous
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPagination({ ...pagination, current_page: 1 });
            }}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'confirmed', label: 'Confirmé' },
              { value: 'completed', label: 'Terminé' },
              { value: 'cancelled', label: 'Annulé' },
              { value: 'no_show', label: 'Absent' },
            ]}
            className="sm:w-48"
          />
        </div>
      </Card>

      {/* Liste des rendez-vous */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : appointments.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <p className="text-dark-400">Aucun rendez-vous trouvé</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.current_page === 1}
            onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-dark-400">
            Page {pagination.current_page} sur {pagination.last_page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal détail */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title={`Rendez-vous ${selectedAppointment?.reference}`}
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-dark-400 text-sm">Client</p>
                <p className="text-white font-medium">{selectedAppointment.client?.full_name}</p>
                <p className="text-dark-400 text-sm">{selectedAppointment.client?.email}</p>
                <p className="text-dark-400 text-sm">{selectedAppointment.client?.phone}</p>
              </div>
              <div>
                <p className="text-dark-400 text-sm">Service</p>
                <p className="text-white font-medium">{selectedAppointment.service?.name}</p>
                <p className="text-dark-400 text-sm">{selectedAppointment.service?.formatted_duration}</p>
                <p className="text-primary-400">{selectedAppointment.formatted_price}</p>
              </div>
            </div>

            <div>
              <p className="text-dark-400 text-sm">Date et heure</p>
              <p className="text-white font-medium">
                {formatDate(selectedAppointment.start_time, "EEEE d MMMM yyyy 'à' HH:mm")}
              </p>
            </div>

            {selectedAppointment.notes && (
              <div>
                <p className="text-dark-400 text-sm">Notes du client</p>
                <p className="text-white">{selectedAppointment.notes}</p>
              </div>
            )}

            {selectedAppointment.notifications && selectedAppointment.notifications.length > 0 && (
              <div>
                <p className="text-dark-400 text-sm mb-2">Notifications</p>
                <div className="space-y-2">
                  {selectedAppointment.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center justify-between p-2 rounded bg-dark-800"
                    >
                      <span className="text-white">{notif.type_label}</span>
                      <Badge className={`status-${notif.status}`}>{notif.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="secondary" onClick={() => setSelectedAppointment(null)} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal annulation */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => {
          setCancelModal({ open: false, appointment: null });
          setCancelReason('');
        }}
        title="Annuler le rendez-vous"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            Êtes-vous sûr de vouloir annuler ce rendez-vous avec {cancelModal.appointment?.client?.full_name} ?
          </p>
          <Textarea
            label="Raison de l'annulation (optionnel)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Indiquez la raison de l'annulation..."
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setCancelModal({ open: false, appointment: null });
                setCancelReason('');
              }}
            >
              Annuler
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleCancel}>
              Confirmer l'annulation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AppointmentRow({
  appointment,
  onAction,
}: {
  appointment: Appointment;
  onAction: (appointment: Appointment, action: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPast = new Date(appointment.end_time) < new Date();

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div
          className="w-2 h-full min-h-[80px] rounded-full flex-shrink-0"
          style={{ backgroundColor: appointment.service?.color }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-white">{appointment.client?.full_name}</p>
                <Badge className={`status-${appointment.status}`}>{appointment.status_label}</Badge>
              </div>
              <p className="text-dark-400">{appointment.service?.name}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-white font-medium">{appointment.formatted_date}</p>
              <p className="text-dark-400">{appointment.formatted_time}</p>
              <p className="text-primary-400 text-sm">{appointment.formatted_price}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
            {appointment.client?.phone && (
              <a
                href={`tel:${appointment.client.phone}`}
                className="flex items-center gap-1 hover:text-primary-400"
              >
                <Phone className="w-4 h-4" />
                {appointment.client.phone}
              </a>
            )}
            {appointment.client?.email && (
              <a
                href={`mailto:${appointment.client.email}`}
                className="flex items-center gap-1 hover:text-primary-400"
              >
                <Mail className="w-4 h-4" />
                {appointment.client.email}
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="secondary" onClick={() => onAction(appointment, 'view')}>
              <Eye className="w-4 h-4" />
              Détails
            </Button>

            {appointment.status === 'pending' && (
              <Button size="sm" variant="success" onClick={() => onAction(appointment, 'confirm')}>
                <CheckCircle className="w-4 h-4" />
                Confirmer
              </Button>
            )}

            {isPast && appointment.status === 'confirmed' && (
              <>
                <Button size="sm" variant="success" onClick={() => onAction(appointment, 'complete')}>
                  <CheckCircle className="w-4 h-4" />
                  Terminé
                </Button>
                <Button size="sm" variant="danger" onClick={() => onAction(appointment, 'no-show')}>
                  <XCircle className="w-4 h-4" />
                  Absent
                </Button>
              </>
            )}

            {appointment.can_be_cancelled && (
              <Button size="sm" variant="danger" onClick={() => onAction(appointment, 'cancel')}>
                <XCircle className="w-4 h-4" />
                Annuler
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
