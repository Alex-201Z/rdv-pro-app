'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { propertiesApi, sellersApi, propertyTypesApi } from '@/lib/api';
import { Seller, PropertyType } from '@/types/real-estate';
import { Card, Button, Input } from '@/components/ui';
import { Home, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [formData, setFormData] = useState({
    seller_id: '',
    property_type_id: '',
    title: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    surface: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    elevator: false,
    parking: false,
    terrace: false,
    garden: false,
    year_built: '',
    price: '',
    agency_fees: '',
    // Commission fields
    commission_percentage: '',
    entered_by_professional: false,
    sold_by_professional: false,
    // Pipeline dates
    registration_date: '',
    first_estimate_date: '',
    estimate_delivery_date: '',
    mandate_signature_date: '',
    offer_received_date: '',
    buyer_offer_name: '',
    sales_agreement_date: '',
    authentic_deed_date: '',
    keys_handover_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculs automatiques pour les commissions
  const [calculatedFees, setCalculatedFees] = useState<number>(0);
  const [netSeller, setNetSeller] = useState<number>(0);
  const [professionalCommission, setProfessionalCommission] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(0);

  useEffect(() => {
    loadSellers();
    loadPropertyTypes();
  }, []);

  // Recalculer les commissions quand le prix ou le pourcentage change
  useEffect(() => {
    const price = parseFloat(formData.price) || 0;
    const percentage = parseFloat(formData.commission_percentage) || 0;

    if (price > 0 && percentage > 0) {
      const fees = Math.round(price * (percentage / 100));
      const net = price - fees;

      setCalculatedFees(fees);
      setNetSeller(net);

      // Calculer commission professionnelle
      let rate = 0;
      if (formData.entered_by_professional) rate += 25;
      if (formData.sold_by_professional) rate += 25;

      setCommissionRate(rate);
      setProfessionalCommission(Math.round(fees * (rate / 100)));
    } else {
      setCalculatedFees(0);
      setNetSeller(0);
      setProfessionalCommission(0);
      setCommissionRate(0);
    }
  }, [formData.price, formData.commission_percentage, formData.entered_by_professional, formData.sold_by_professional]);

  const loadSellers = async () => {
    try {
      const response = await sellersApi.list();
      setSellers(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };

  const loadPropertyTypes = async () => {
    try {
      const response = await propertyTypesApi.list();
      setPropertyTypes(response.data);
    } catch (error) {
      console.error('Error loading property types:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Convert string values to proper types
    const submitData = {
      seller_id: Number(formData.seller_id),
      property_type_id: Number(formData.property_type_id),
      title: formData.title,
      description: formData.description || undefined,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postal_code,
      surface: Number(formData.surface),
      rooms: formData.rooms ? Number(formData.rooms) : undefined,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      floor: formData.floor ? Number(formData.floor) : undefined,
      elevator: formData.elevator,
      parking: formData.parking,
      terrace: formData.terrace,
      garden: formData.garden,
      year_built: formData.year_built ? Number(formData.year_built) : undefined,
      price: Number(formData.price),
      agency_fees: formData.agency_fees ? Number(formData.agency_fees) : undefined,
    };

    try {
      setLoading(true);
      await propertiesApi.create(submitData);
      toast.success('Propriété créée avec succès. Les matches sont en cours de génération...');
      router.push('/properties');
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="w-7 h-7" />
            Nouvelle propriété
          </h1>
          <p className="text-dark-400 mt-1">
            Ajoutez une nouvelle propriété à votre catalogue
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Informations générales</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Vendeur <span className="text-red-400">*</span>
                </label>
                <select
                  name="seller_id"
                  value={formData.seller_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">Sélectionner un vendeur</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.full_name}
                    </option>
                  ))}
                </select>
                {errors.seller_id && <p className="text-red-400 text-sm mt-1">{errors.seller_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Type de bien <span className="text-red-400">*</span>
                </label>
                <select
                  name="property_type_id"
                  value={formData.property_type_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">Sélectionner un type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.property_type_id && <p className="text-red-400 text-sm mt-1">{errors.property_type_id}</p>}
              </div>
            </div>

            <Input
              label="Titre"
              name="title"
              placeholder="Appartement T3 avec vue mer"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
              <textarea
                name="description"
                placeholder="Description détaillée de la propriété..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        </Card>

        {/* Localisation */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Localisation</h2>
          <div className="space-y-4">
            <Input
              label="Adresse"
              name="address"
              placeholder="12 Rue de la Paix"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ville"
                name="city"
                placeholder="Paris"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                required
              />

              <Input
                label="Code postal"
                name="postal_code"
                placeholder="75001"
                value={formData.postal_code}
                onChange={handleChange}
                error={errors.postal_code}
                required
              />
            </div>
          </div>
        </Card>

        {/* Caractéristiques */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Caractéristiques</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Surface (m²)"
                type="number"
                name="surface"
                placeholder="75"
                value={formData.surface}
                onChange={handleChange}
                error={errors.surface}
                required
              />

              <Input
                label="Pièces"
                type="number"
                name="rooms"
                placeholder="3"
                value={formData.rooms}
                onChange={handleChange}
                error={errors.rooms}
              />

              <Input
                label="Chambres"
                type="number"
                name="bedrooms"
                placeholder="2"
                value={formData.bedrooms}
                onChange={handleChange}
                error={errors.bedrooms}
              />

              <Input
                label="Salles de bain"
                type="number"
                name="bathrooms"
                placeholder="1"
                value={formData.bathrooms}
                onChange={handleChange}
                error={errors.bathrooms}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <Input
                label="Étage"
                type="number"
                name="floor"
                placeholder="3"
                value={formData.floor}
                onChange={handleChange}
                error={errors.floor}
              />

              <Input
                label="Année de construction"
                type="number"
                name="year_built"
                placeholder="2010"
                value={formData.year_built}
                onChange={handleChange}
                error={errors.year_built}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="elevator"
                  checked={formData.elevator}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span>Ascenseur</span>
              </label>
              <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span>Parking</span>
              </label>
              <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="terrace"
                  checked={formData.terrace}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span>Terrasse</span>
              </label>
              <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="garden"
                  checked={formData.garden}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span>Jardin</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Prix et Commission */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Prix et Commission</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prix de vente (€)"
                type="number"
                name="price"
                placeholder="450000"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                required
              />

              <Input
                label="Commission agence (%)"
                type="number"
                name="commission_percentage"
                placeholder="5"
                step="0.01"
                value={formData.commission_percentage}
                onChange={handleChange}
                error={errors.commission_percentage}
              />
            </div>

            {/* Affichage des calculs automatiques */}
            {calculatedFees > 0 && (
              <div className="mt-4 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                <h3 className="text-sm font-semibold text-white mb-3">Calculs automatiques</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Honoraires agence:</span>
                    <span className="text-primary-400 font-semibold">{calculatedFees.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Net vendeur:</span>
                    <span className="text-green-400 font-semibold">{netSeller.toLocaleString()} €</span>
                  </div>
                </div>
              </div>
            )}

            {/* Checkboxes pour le professionnel */}
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="entered_by_professional"
                  checked={formData.entered_by_professional}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span>Bien rentré par le professionnel</span>
              </label>
              <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="sold_by_professional"
                  checked={formData.sold_by_professional}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span>Bien vendu par le professionnel</span>
              </label>
            </div>

            {/* Affichage commission professionnelle */}
            {professionalCommission > 0 && (
              <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-dark-300">Commission professionnelle:</span>
                  <span className="text-xl text-yellow-400 font-bold">
                    {professionalCommission.toLocaleString()} € <span className="text-sm">({commissionRate}%)</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Pipeline de Vente */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">📅 Suivi du Pipeline de Vente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date d'enregistrement"
              type="datetime-local"
              name="registration_date"
              value={formData.registration_date}
              onChange={handleChange}
              error={errors.registration_date}
            />

            <Input
              label="Date première estimation (R1)"
              type="date"
              name="first_estimate_date"
              value={formData.first_estimate_date}
              onChange={handleChange}
              error={errors.first_estimate_date}
            />

            <Input
              label="Date rendu estimation (R2)"
              type="date"
              name="estimate_delivery_date"
              value={formData.estimate_delivery_date}
              onChange={handleChange}
              error={errors.estimate_delivery_date}
            />

            <Input
              label="Date signature mandat"
              type="date"
              name="mandate_signature_date"
              value={formData.mandate_signature_date}
              onChange={handleChange}
              error={errors.mandate_signature_date}
            />

            <Input
              label="Date réception offre"
              type="date"
              name="offer_received_date"
              value={formData.offer_received_date}
              onChange={handleChange}
              error={errors.offer_received_date}
            />

            <Input
              label="Nom de l'acheteur"
              type="text"
              name="buyer_offer_name"
              placeholder="Jean Dupont"
              value={formData.buyer_offer_name}
              onChange={handleChange}
              error={errors.buyer_offer_name}
            />

            <Input
              label="Date compromis de vente"
              type="date"
              name="sales_agreement_date"
              value={formData.sales_agreement_date}
              onChange={handleChange}
              error={errors.sales_agreement_date}
            />

            <Input
              label="Date acte authentique"
              type="date"
              name="authentic_deed_date"
              value={formData.authentic_deed_date}
              onChange={handleChange}
              error={errors.authentic_deed_date}
            />

            <Input
              label="Date remise des clés"
              type="date"
              name="keys_handover_date"
              value={formData.keys_handover_date}
              onChange={handleChange}
              error={errors.keys_handover_date}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading} className="flex-1">
            Créer la propriété
          </Button>
          <Link href="/properties">
            <Button type="button" variant="secondary">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
