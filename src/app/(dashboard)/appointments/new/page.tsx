'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appointmentsApi, buyersApi, propertiesApi } from '@/lib/api';
import { Buyer, Property } from '@/types/real-estate';
import { Card, Button, Input } from '@/components/ui';
import { Calendar, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    appointment_type: 'property_visit',
    property_id: '',
    buyer_id: '',
    start_time: '',
    duration_minutes: '60',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBuyers();
    loadProperties();
  }, []);

  const loadBuyers = async () => {
    try {
      const response = await buyersApi.list();
      setBuyers(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading buyers:', error);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await propertiesApi.list();
      setProperties(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const submitData = {
      appointment_type: formData.appointment_type,
      property_id: formData.property_id ? Number(formData.property_id) : undefined,
      buyer_id: formData.buyer_id ? Number(formData.buyer_id) : undefined,
      start_time: formData.start_time,
      duration_minutes: Number(formData.duration_minutes),
      notes: formData.notes || undefined,
    };

    try {
      setLoading(true);
      await appointmentsApi.store(submitData);
      toast.success('Rendez-vous créé avec succès');
      router.push('/appointments');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          apiErrors[key] = (value as string[])[0];
        });
        setErrors(apiErrors);
      } else {
        toast.error(error.response?.data?.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/appointments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7" />
            Nouveau rendez-vous
          </h1>
          <p className="text-dark-400 mt-1">
            Créer un rendez-vous manuellement
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de RDV et Durée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Type de rendez-vous <span className="text-red-400">*</span>
              </label>
              <select
                name="appointment_type"
                value={formData.appointment_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="property_visit">Visite de bien</option>
                <option value="signing">Signature</option>
                <option value="estimate">Estimation</option>
                <option value="other">Autre</option>
              </select>
              {errors.appointment_type && <p className="text-red-400 text-sm mt-1">{errors.appointment_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Durée (minutes) <span className="text-red-400">*</span>
              </label>
              <select
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 heure</option>
                <option value="90">1h30</option>
                <option value="120">2 heures</option>
              </select>
              {errors.duration_minutes && <p className="text-red-400 text-sm mt-1">{errors.duration_minutes}</p>}
            </div>
          </div>

          {/* Propriété et Acheteur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Propriété {formData.appointment_type === 'property_visit' && <span className="text-red-400">*</span>}
              </label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                required={formData.appointment_type === 'property_visit'}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="">Sélectionner une propriété</option>
                {properties.filter(p => p.status === 'available').map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.city}
                  </option>
                ))}
              </select>
              {errors.property_id && <p className="text-red-400 text-sm mt-1">{errors.property_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Acheteur
              </label>
              <select
                name="buyer_id"
                value={formData.buyer_id}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="">Sélectionner un acheteur</option>
                {buyers.filter(b => b.status === 'active').map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.full_name}
                  </option>
                ))}
              </select>
              {errors.buyer_id && <p className="text-red-400 text-sm mt-1">{errors.buyer_id}</p>}
            </div>
          </div>

          {/* Date et heure */}
          <Input
            label="Date et heure"
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            error={errors.start_time}
            required
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              placeholder="Notes supplémentaires sur le rendez-vous..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-dark-700">
            <Button type="submit" isLoading={loading} className="flex-1">
              Créer le rendez-vous
            </Button>
            <Link href="/appointments">
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
