'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { sellersApi } from '@/lib/api';
import { Seller } from '@/types/real-estate';
import { Card, Button, Input, Spinner } from '@/components/ui';
import { Building2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditSellerPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    project_start_date: '',
    open_to_offmarket: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.id) {
      loadSeller();
    }
  }, [params.id]);

  const loadSeller = async () => {
    try {
      setLoading(true);
      const response = await sellersApi.get(Number(params.id));
      const sellerData = response.data.data || response.data;
      setSeller(sellerData);
      setFormData({
        first_name: sellerData.first_name,
        last_name: sellerData.last_name,
        email: sellerData.email,
        phone: sellerData.phone,
        address: sellerData.address || '',
        notes: sellerData.notes || '',
        project_start_date: sellerData.project_start_date || '',
        open_to_offmarket: sellerData.open_to_offmarket || false,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
      router.push('/sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setLoading(true);
      await sellersApi.update(Number(params.id), formData);
      toast.success('Vendeur modifié avec succès');
      router.push(`/sellers/${params.id}`);
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

  if (loading && !seller) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sellers/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7" />
            Modifier le vendeur
          </h1>
          <p className="text-dark-400 mt-1">
            {seller?.full_name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              name="first_name"
              placeholder="Jean"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              required
            />
            <Input
              label="Nom"
              name="last_name"
              placeholder="Dupont"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="jean.dupont@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Téléphone"
            type="tel"
            name="phone"
            placeholder="+33 6 12 34 56 78"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />

          <Input
            label="Adresse"
            name="address"
            placeholder="12 Rue de la Paix, 75001 Paris"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
          />

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              placeholder="Informations complémentaires..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

          <Input
            label="Date de début de projet"
            type="date"
            name="project_start_date"
            value={formData.project_start_date}
            onChange={handleChange}
            error={errors.project_start_date}
          />

          <div>
            <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
              <input
                type="checkbox"
                name="open_to_offmarket"
                checked={formData.open_to_offmarket}
                onChange={handleChange}
                className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
              />
              <span>Ouvert aux propositions off-market</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-dark-700">
            <Button type="submit" isLoading={loading} className="flex-1">
              Enregistrer les modifications
            </Button>
            <Link href={`/sellers/${params.id}`}>
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
