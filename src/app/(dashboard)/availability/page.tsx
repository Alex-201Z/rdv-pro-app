'use client';

import { useEffect, useState } from 'react';
import { availabilityApi } from '@/lib/api';
import { Availability, AvailabilityException } from '@/types';
import { Card, Button, Modal, Input, Spinner, Badge } from '@/components/ui';
import { generateTimeSlots } from '@/lib/utils';
import { Clock, Plus, Trash2, Save, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS = generateTimeSlots(6, 22, 15);

export default function AvailabilityPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exceptionModal, setExceptionModal] = useState(false);
  const [exceptionForm, setExceptionForm] = useState({ date: '', reason: '', is_available: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availRes, excepRes] = await Promise.all([
        availabilityApi.list(),
        availabilityApi.exceptions(),
      ]);
      setAvailabilities(availRes.data.availabilities);
      setExceptions(excepRes.data.exceptions);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (dayIndex: number) => {
    setAvailabilities(prev => prev.map(day => {
      if (day.day === dayIndex) {
        return {
          ...day,
          slots: [...day.slots, { start_time: '09:00', end_time: '12:00', is_active: true }]
        };
      }
      return day;
    }));
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailabilities(prev => prev.map(day => {
      if (day.day === dayIndex) {
        return {
          ...day,
          slots: day.slots.filter((_, i) => i !== slotIndex)
        };
      }
      return day;
    }));
  };

  const updateSlot = (dayIndex: number, slotIndex: number, field: string, value: string) => {
    setAvailabilities(prev => prev.map(day => {
      if (day.day === dayIndex) {
        return {
          ...day,
          slots: day.slots.map((slot, i) => {
            if (i === slotIndex) {
              return { ...slot, [field]: value };
            }
            return slot;
          })
        };
      }
      return day;
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = availabilities.map(day => ({
        day_of_week: day.day,
        slots: day.slots,
      }));
      await availabilityApi.update({ availabilities: data });
      toast.success('Disponibilités enregistrées');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await availabilityApi.addException(exceptionForm);
      toast.success('Exception ajoutée');
      setExceptionModal(false);
      setExceptionForm({ date: '', reason: '', is_available: false });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDeleteException = async (id: number) => {
    try {
      await availabilityApi.deleteException(id);
      toast.success('Exception supprimée');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner className="w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Disponibilités</h1>
          <p className="text-dark-400">Définissez vos heures de travail</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <Save className="w-4 h-4" />
          Enregistrer
        </Button>
      </div>

      {/* Horaires hebdomadaires */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Horaires hebdomadaires</h2>
        <div className="space-y-4">
          {availabilities.map((day) => (
            <div key={day.day} className="p-4 rounded-lg bg-dark-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{day.day_name}</span>
                <Button variant="ghost" size="sm" onClick={() => addSlot(day.day)}>
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </div>
              {day.slots.length === 0 ? (
                <p className="text-dark-500 text-sm">Fermé</p>
              ) : (
                <div className="space-y-2">
                  {day.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center gap-2">
                      <select
                        value={slot.start_time}
                        onChange={(e) => updateSlot(day.day, slotIndex, 'start_time', e.target.value)}
                        className="bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm"
                      >
                        {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
                      </select>
                      <span className="text-dark-400">à</span>
                      <select
                        value={slot.end_time}
                        onChange={(e) => updateSlot(day.day, slotIndex, 'end_time', e.target.value)}
                        className="bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-white text-sm"
                      >
                        {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
                      </select>
                      <Button variant="ghost" size="sm" onClick={() => removeSlot(day.day, slotIndex)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Exceptions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Exceptions (vacances, jours fériés)</h2>
          <Button variant="secondary" onClick={() => setExceptionModal(true)}>
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
        {exceptions.length === 0 ? (
          <p className="text-dark-400 text-center py-8">Aucune exception programmée</p>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exception) => (
              <div key={exception.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-dark-400" />
                  <div>
                    <p className="text-white">{exception.formatted_date}</p>
                    {exception.reason && <p className="text-dark-400 text-sm">{exception.reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={exception.is_available ? 'success' : 'danger'}>
                    {exception.is_full_day ? 'Fermé' : `${exception.start_time} - ${exception.end_time}`}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteException(exception.id)}>
                    <X className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal exception */}
      <Modal isOpen={exceptionModal} onClose={() => setExceptionModal(false)} title="Ajouter une exception">
        <form onSubmit={handleAddException} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={exceptionForm.date}
            onChange={(e) => setExceptionForm({ ...exceptionForm, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            label="Raison (optionnel)"
            value={exceptionForm.reason}
            onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
            placeholder="Ex: Vacances, jour férié..."
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setExceptionModal(false)}>Annuler</Button>
            <Button type="submit" className="flex-1">Ajouter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
