'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { buyersApi, propertyTypesApi } from '@/lib/api';
import { Buyer, PropertyType, BuyerCriteriaFormData } from '@/types/real-estate';
import { Card, Button, Spinner, Badge, Input } from '@/components/ui';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Target,
  Edit,
  Archive,
  Trash2,
  Plus,
  Home,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [criteriaLoading, setCriteriaLoading] = useState(false);

  const [criteriaForm, setCriteriaForm] = useState<BuyerCriteriaFormData>({
    property_type_id: undefined,
    cities: '',
    min_budget: undefined,
    max_budget: undefined,
    min_surface: undefined,
    max_surface: undefined,
    min_rooms: undefined,
    max_rooms: undefined,
    min_bedrooms: undefined,
    max_bedrooms: undefined,
    has_parking: false,
    has_elevator: false,
    has_terrace: false,
    has_garden: false,
  });

  useEffect(() => {
    if (params.id) {
      loadBuyer();
      loadPropertyTypes();
    }
  }, [params.id]);

  const loadBuyer = async () => {
    try {
      setLoading(true);
      const response = await buyersApi.get(Number(params.id));
      setBuyer(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
      router.push('/buyers');
    } finally {
      setLoading(false);
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

  const handleArchive = async () => {
    if (!buyer || !confirm('Voulez-vous vraiment archiver cet acheteur ?')) return;

    try {
      await buyersApi.archive(buyer.id);
      toast.success('Acheteur archivé');
      router.push('/buyers');
    } catch (error: any) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const handleDelete = async () => {
    if (!buyer || !confirm('Voulez-vous vraiment supprimer cet acheteur ? Cette action est irréversible.')) return;

    try {
      await buyersApi.delete(buyer.id);
      toast.success('Acheteur supprimé');
      router.push('/buyers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCriteriaForm({
      ...criteriaForm,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === '' ? undefined : value,
    });
  };

  const handleAddCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer) return;

    try {
      setCriteriaLoading(true);
      await buyersApi.addCriteria(buyer.id, criteriaForm);
      toast.success('Critères ajoutés avec succès');
      setShowCriteriaForm(false);
      setCriteriaForm({
        property_type_id: undefined,
        cities: '',
        min_budget: undefined,
        max_budget: undefined,
        min_surface: undefined,
        max_surface: undefined,
        min_rooms: undefined,
        max_rooms: undefined,
        min_bedrooms: undefined,
        max_bedrooms: undefined,
        has_parking: false,
        has_elevator: false,
        has_terrace: false,
        has_garden: false,
      });
      loadBuyer();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout des critères');
    } finally {
      setCriteriaLoading(false);
    }
  };

  const handleDeleteCriteria = async (criteriaId: number) => {
    if (!buyer || !confirm('Voulez-vous vraiment supprimer ces critères ?')) return;

    try {
      await buyersApi.deleteCriteria(buyer.id, criteriaId);
      toast.success('Critères supprimés');
      loadBuyer();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!buyer) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/buyers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7" />
              {buyer.full_name}
            </h1>
            <p className="text-dark-400 mt-1">
              Acheteur #{buyer.id} · Ajouté le {new Date(buyer.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/buyers/${buyer.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          </Link>
          {buyer.status === 'active' && (
            <Button variant="danger" onClick={handleArchive}>
              <Archive className="w-4 h-4" />
              Archiver
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Informations</h2>
              <Badge className={buyer.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                {buyer.status === 'active' ? 'Actif' : 'Archivé'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-sm text-dark-400">Email</p>
                  <a href={`mailto:${buyer.email}`} className="text-white hover:text-primary-400 transition-colors">
                    {buyer.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-sm text-dark-400">Téléphone</p>
                  <a href={`tel:${buyer.phone}`} className="text-white hover:text-primary-400 transition-colors">
                    {buyer.phone}
                  </a>
                </div>
              </div>

              {buyer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-dark-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-dark-400">Adresse</p>
                    <p className="text-white">{buyer.address}</p>
                  </div>
                </div>
              )}

              {buyer.notes && (
                <div className="pt-4 border-t border-dark-700">
                  <p className="text-sm text-dark-400 mb-2">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{buyer.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Critères de recherche */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Critères de recherche ({buyer.criteria?.length || 0})
              </h2>
              <Button size="sm" onClick={() => setShowCriteriaForm(!showCriteriaForm)}>
                <Plus className="w-4 h-4" />
                Ajouter des critères
              </Button>
            </div>

            {showCriteriaForm && (
              <form onSubmit={handleAddCriteria} className="mb-6 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                <h3 className="text-white font-medium mb-4">Nouveaux critères</h3>
                <p className="text-sm text-dark-400 mb-4">
                  ℹ️ Tous les champs sont optionnels. Remplissez uniquement les critères qui vous intéressent.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Type de bien</label>
                    <select
                      name="property_type_id"
                      value={criteriaForm.property_type_id || ''}
                      onChange={handleCriteriaChange}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      <option value="">Tous types</option>
                      {propertyTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Villes (séparées par des virgules)"
                    name="cities"
                    placeholder="Paris, Lyon, Marseille"
                    value={criteriaForm.cities}
                    onChange={handleCriteriaChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Budget minimum (€)"
                      type="number"
                      name="min_budget"
                      placeholder="200000"
                      value={criteriaForm.min_budget || ''}
                      onChange={handleCriteriaChange}
                    />
                    <Input
                      label="Budget maximum (€)"
                      type="number"
                      name="max_budget"
                      placeholder="500000"
                      value={criteriaForm.max_budget || ''}
                      onChange={handleCriteriaChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Surface min (m²)"
                      type="number"
                      name="min_surface"
                      placeholder="50"
                      value={criteriaForm.min_surface || ''}
                      onChange={handleCriteriaChange}
                    />
                    <Input
                      label="Surface max (m²)"
                      type="number"
                      name="max_surface"
                      placeholder="100"
                      value={criteriaForm.max_surface || ''}
                      onChange={handleCriteriaChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Pièces min"
                      type="number"
                      name="min_rooms"
                      placeholder="2"
                      value={criteriaForm.min_rooms || ''}
                      onChange={handleCriteriaChange}
                    />
                    <Input
                      label="Pièces max"
                      type="number"
                      name="max_rooms"
                      placeholder="4"
                      value={criteriaForm.max_rooms || ''}
                      onChange={handleCriteriaChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Chambres min"
                      type="number"
                      name="min_bedrooms"
                      placeholder="1"
                      value={criteriaForm.min_bedrooms || ''}
                      onChange={handleCriteriaChange}
                    />
                    <Input
                      label="Chambres max"
                      type="number"
                      name="max_bedrooms"
                      placeholder="3"
                      value={criteriaForm.max_bedrooms || ''}
                      onChange={handleCriteriaChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has_parking"
                        checked={criteriaForm.has_parking}
                        onChange={handleCriteriaChange}
                        className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Parking requis</span>
                    </label>
                    <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has_elevator"
                        checked={criteriaForm.has_elevator}
                        onChange={handleCriteriaChange}
                        className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Ascenseur requis</span>
                    </label>
                    <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has_terrace"
                        checked={criteriaForm.has_terrace}
                        onChange={handleCriteriaChange}
                        className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Terrasse souhaitée</span>
                    </label>
                    <label className="flex items-center gap-2 text-dark-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has_garden"
                        checked={criteriaForm.has_garden}
                        onChange={handleCriteriaChange}
                        className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Jardin souhaité</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" isLoading={criteriaLoading}>
                    Ajouter
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowCriteriaForm(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            {buyer.criteria && buyer.criteria.length > 0 ? (
              <div className="space-y-3">
                {buyer.criteria.map((criteria) => (
                  <div
                    key={criteria.id}
                    className="p-4 rounded-lg bg-dark-800/50 border border-dark-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          {criteria.property_type?.name || 'Tous types'}
                        </h3>
                        <p className="text-sm text-dark-400">
                          {criteria.cities || 'Toutes villes'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCriteria(criteria.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {criteria.min_budget && (
                        <div>
                          <span className="text-dark-400">Budget min:</span>{' '}
                          <span className="text-white">{criteria.min_budget.toLocaleString()}€</span>
                        </div>
                      )}
                      {criteria.max_budget && (
                        <div>
                          <span className="text-dark-400">Budget max:</span>{' '}
                          <span className="text-white">{criteria.max_budget.toLocaleString()}€</span>
                        </div>
                      )}
                      {criteria.min_surface && (
                        <div>
                          <span className="text-dark-400">Surface min:</span>{' '}
                          <span className="text-white">{criteria.min_surface}m²</span>
                        </div>
                      )}
                      {criteria.max_surface && (
                        <div>
                          <span className="text-dark-400">Surface max:</span>{' '}
                          <span className="text-white">{criteria.max_surface}m²</span>
                        </div>
                      )}
                      {criteria.min_rooms && (
                        <div>
                          <span className="text-dark-400">Pièces min:</span>{' '}
                          <span className="text-white">{criteria.min_rooms}</span>
                        </div>
                      )}
                      {criteria.max_rooms && (
                        <div>
                          <span className="text-dark-400">Pièces max:</span>{' '}
                          <span className="text-white">{criteria.max_rooms}</span>
                        </div>
                      )}
                    </div>

                    {(criteria.has_parking || criteria.has_elevator || criteria.has_terrace || criteria.has_garden) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {criteria.has_parking && (
                          <Badge className="bg-blue-500/20 text-blue-400">Parking</Badge>
                        )}
                        {criteria.has_elevator && (
                          <Badge className="bg-blue-500/20 text-blue-400">Ascenseur</Badge>
                        )}
                        {criteria.has_terrace && (
                          <Badge className="bg-green-500/20 text-green-400">Terrasse</Badge>
                        )}
                        {criteria.has_garden && (
                          <Badge className="bg-green-500/20 text-green-400">Jardin</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400 mb-4">Aucun critère de recherche défini</p>
                <Button size="sm" onClick={() => setShowCriteriaForm(true)}>
                  <Plus className="w-4 h-4" />
                  Ajouter des critères
                </Button>
              </div>
            )}
          </Card>

          {/* Matches */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Home className="w-5 h-5" />
                Correspondances ({buyer.matches?.length || 0})
              </h2>
              <Link href="/matches">
                <Button size="sm" variant="secondary">Voir tous les matches</Button>
              </Link>
            </div>

            {buyer.matches && buyer.matches.length > 0 ? (
              <div className="space-y-3">
                {buyer.matches.slice(0, 5).map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors border border-dark-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">
                            {match.property?.title || 'Propriété'}
                          </h3>
                          <Badge className={`score-${Math.floor(match.match_score / 20)}`}>
                            {match.match_score}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-dark-400">
                          {match.property?.city} · {match.property?.surface}m²
                        </p>
                        {match.property?.formatted_price && (
                          <p className="text-primary-400 font-semibold mt-2">
                            {match.property.formatted_price}
                          </p>
                        )}
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400">Aucune correspondance trouvée</p>
              </div>
            )}
          </Card>
        </div>

        {/* Statistiques */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-400">Critères actifs</p>
                <p className="text-2xl font-bold text-white">
                  {buyer.criteria?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Correspondances</p>
                <p className="text-2xl font-bold text-blue-400">
                  {buyer.matches?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Meilleur match</p>
                <p className="text-2xl font-bold text-green-400">
                  {buyer.matches && buyer.matches.length > 0
                    ? `${Math.max(...buyer.matches.map(m => m.match_score))}%`
                    : '-'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
