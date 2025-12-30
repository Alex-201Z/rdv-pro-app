'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api';
import { Property } from '@/types/real-estate';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import PropertyPhotoUpload from '@/components/property/PropertyPhotoUpload';
import {
  Home,
  ArrowLeft,
  MapPin,
  Maximize,
  DoorOpen,
  Bed,
  Bath,
  Car,
  Building,
  Calendar,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  Euro,
  FileText,
  FileCheck,
  Key,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProperty();
    }
  }, [params.id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await propertiesApi.get(Number(params.id));
      setProperty(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
      router.push('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!property || !confirm('Voulez-vous vraiment supprimer cette propriété ? Cette action est irréversible.')) return;

    try {
      await propertiesApi.delete(property.id);
      toast.success('Propriété supprimée');
      router.push('/properties');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleMarkAsSold = async () => {
    if (!property || !confirm('Voulez-vous marquer cette propriété comme vendue ?')) return;

    try {
      await propertiesApi.markAsSold(property.id);
      toast.success('Propriété marquée comme vendue');
      loadProperty();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'under_offer':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'sold':
        return 'bg-blue-500/20 text-blue-400';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'under_offer':
        return 'Sous offre';
      case 'sold':
        return 'Vendue';
      case 'archived':
        return 'Archivée';
      default:
        return status;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-orange-500/20 text-orange-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {property.title}
            </h1>
            <p className="text-dark-400 mt-1">
              Propriété #{property.id} · Ajoutée le {new Date(property.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/properties/${property.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          </Link>
          {property.status === 'available' && (
            <Button variant="secondary" onClick={handleMarkAsSold}>
              <CheckCircle className="w-4 h-4" />
              Marquer vendue
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Galerie Photos */}
      {property.featured_photo || (property.photos && property.photos.length > 0) ? (
        <Card>
          <div className="relative h-96 bg-dark-800 rounded-lg overflow-hidden group">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/storage/${
                Array.isArray(property.photos) && property.photos[currentPhotoIndex]
                  ? property.photos[currentPhotoIndex]
                  : property.featured_photo || (Array.isArray(property.photos) ? property.photos[0] : '')
              }`}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            {Array.isArray(property.photos) && property.photos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? property.photos!.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => (prev === property.photos!.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Indicateur de position */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1} / {property.photos.length}
                </div>
              </>
            )}
          </div>

          {/* Miniatures */}
          {Array.isArray(property.photos) && property.photos.length > 1 && (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
              {property.photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`relative h-20 bg-dark-800 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    currentPhotoIndex === index
                      ? 'ring-2 ring-primary-500 opacity-100'
                      : 'hover:opacity-80 opacity-60'
                  }`}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/storage/${photo}`}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {property.featured_photo === photo && (
                    <div className="absolute top-1 right-1 bg-primary-500 rounded-full p-1">
                      <Star className="w-3 h-3 text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Informations générales</h2>
              <Badge className={getStatusColor(property.status)}>
                {getStatusLabel(property.status)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-400 mb-1">Type de bien</p>
                <p className="text-white font-medium">{property.property_type?.name || 'N/A'}</p>
              </div>

              {property.description && (
                <div>
                  <p className="text-sm text-dark-400 mb-1">Description</p>
                  <p className="text-white whitespace-pre-wrap">{property.description}</p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-sm text-dark-400">Adresse</p>
                  <p className="text-white">{property.address}</p>
                  <p className="text-white">{property.postal_code} {property.city}</p>
                </div>
              </div>

              {property.seller && (
                <div className="pt-4 border-t border-dark-700">
                  <p className="text-sm text-dark-400 mb-2">Vendeur</p>
                  <Link href={`/sellers/${property.seller.id}`} className="text-primary-400 hover:text-primary-300">
                    {property.seller.full_name}
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Caractéristiques */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-6">Caractéristiques</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Maximize className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Surface</p>
                  <p className="text-white font-semibold">{property.surface} m²</p>
                </div>
              </div>

              {property.rooms && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <DoorOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Pièces</p>
                    <p className="text-white font-semibold">{property.rooms}</p>
                  </div>
                </div>
              )}

              {property.bedrooms && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Bed className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Chambres</p>
                    <p className="text-white font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
              )}

              {property.bathrooms && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Bath className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Salles de bain</p>
                    <p className="text-white font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
              )}

              {property.floor !== null && property.floor !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Étage</p>
                    <p className="text-white font-semibold">{property.floor}</p>
                  </div>
                </div>
              )}

              {property.year_built && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Année</p>
                    <p className="text-white font-semibold">{property.year_built}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-dark-700 flex flex-wrap gap-2">
              {property.elevator && (
                <Badge className="bg-blue-500/20 text-blue-400">Ascenseur</Badge>
              )}
              {property.parking && (
                <Badge className="bg-blue-500/20 text-blue-400">Parking</Badge>
              )}
              {property.terrace && (
                <Badge className="bg-green-500/20 text-green-400">Terrasse</Badge>
              )}
              {property.garden && (
                <Badge className="bg-green-500/20 text-green-400">Jardin</Badge>
              )}
            </div>
          </Card>

          {/* Photos */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-6">📸 Photos du bien</h2>
            <PropertyPhotoUpload property={property} onUpdate={loadProperty} />
          </Card>

          {/* Correspondances */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Acheteurs potentiels ({property.matches?.length || 0})
              </h2>
              <Link href="/matches">
                <Button size="sm" variant="secondary">Voir tous les matches</Button>
              </Link>
            </div>

            {property.matches && property.matches.length > 0 ? (
              <div className="space-y-3">
                {property.matches
                  .sort((a, b) => b.match_score - a.match_score)
                  .slice(0, 10)
                  .map((match) => (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors border border-dark-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Link href={`/buyers/${match.buyer_id}`}>
                              <h3 className="font-semibold text-white hover:text-primary-400 transition-colors">
                                {match.buyer?.full_name || 'Acheteur'}
                              </h3>
                            </Link>
                            <Badge className={getMatchScoreColor(match.match_score)}>
                              {match.match_score}% match
                            </Badge>
                          </div>
                          {match.buyer && (
                            <div className="text-sm text-dark-400 space-y-1">
                              <p>{match.buyer.email}</p>
                              <p>{match.buyer.phone}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400">Aucune correspondance trouvée</p>
                <p className="text-sm text-dark-500 mt-1">
                  Les acheteurs avec des critères correspondants apparaîtront ici
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prix et Commissions */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">💰 Prix et Commissions</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-400">Prix de vente</p>
                <p className="text-3xl font-bold text-primary-400">
                  {property.formatted_price}
                </p>
              </div>

              {property.commission_percentage && (
                <>
                  <div className="pt-3 border-t border-dark-700">
                    <p className="text-sm text-dark-400">Commission agence</p>
                    <p className="text-lg font-semibold text-white">
                      {property.commission_percentage}%
                    </p>
                  </div>

                  {property.calculated_agency_fees && (
                    <div>
                      <p className="text-sm text-dark-400">Honoraires agence</p>
                      <p className="text-xl font-semibold text-primary-400">
                        {property.formatted_agency_fees}
                      </p>
                    </div>
                  )}

                  {property.net_seller && (
                    <div>
                      <p className="text-sm text-dark-400">Net vendeur</p>
                      <p className="text-xl font-semibold text-green-400">
                        {property.formatted_net_seller}
                      </p>
                    </div>
                  )}

                  {property.professional_commission && property.professional_commission > 0 && (
                    <div className="pt-3 border-t border-dark-700">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {property.entered_by_professional && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">Rentré par le pro</Badge>
                        )}
                        {property.sold_by_professional && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">Vendu par le pro</Badge>
                        )}
                      </div>
                      <p className="text-sm text-dark-400">Commission professionnelle</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {property.formatted_professional_commission}
                      </p>
                      <p className="text-sm text-yellow-400/70 mt-1">
                        ({property.professional_commission_rate}% des honoraires)
                      </p>
                    </div>
                  )}
                </>
              )}

              {property.agency_fees && !property.commission_percentage && (
                <div>
                  <p className="text-sm text-dark-400">Frais d'agence</p>
                  <p className="text-xl font-semibold text-white">
                    {property.agency_fees.toLocaleString()} €
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Pipeline de Vente */}
          {(property.registration_date || property.first_estimate_date || property.estimate_delivery_date ||
            property.mandate_signature_date || property.offer_received_date || property.sales_agreement_date ||
            property.authentic_deed_date || property.keys_handover_date) && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">📅 Pipeline de Vente</h2>
              <div className="space-y-3">
                {property.registration_date && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-dark-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Enregistrement</p>
                      <p className="text-sm text-white">
                        {new Date(property.registration_date).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {property.first_estimate_date && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Première estimation (R1)</p>
                      <p className="text-sm text-white">
                        {new Date(property.first_estimate_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {property.estimate_delivery_date && (
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-4 h-4 text-cyan-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Rendu estimation (R2)</p>
                      <p className="text-sm text-white">
                        {new Date(property.estimate_delivery_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {property.mandate_signature_date && (
                  <div className="flex items-start gap-3">
                    <Edit className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Signature mandat</p>
                      <p className="text-sm text-white">
                        {new Date(property.mandate_signature_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {property.offer_received_date && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Offre reçue</p>
                      <p className="text-sm text-white">
                        {new Date(property.offer_received_date).toLocaleDateString('fr-FR')}
                      </p>
                      {property.buyer_offer_name && (
                        <p className="text-xs text-dark-500 mt-1">
                          Acheteur: {property.buyer_offer_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {property.sales_agreement_date && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Compromis de vente</p>
                      <p className="text-sm text-white">
                        {new Date(property.sales_agreement_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {property.authentic_deed_date && (
                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Acte authentique</p>
                      <p className="text-sm text-white">
                        {new Date(property.authentic_deed_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {property.keys_handover_date && (
                  <div className="flex items-start gap-3">
                    <Key className="w-4 h-4 text-primary-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-dark-400">Remise des clés</p>
                      <p className="text-sm text-white">
                        {new Date(property.keys_handover_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Statistiques */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-400">Correspondances totales</p>
                <p className="text-2xl font-bold text-white">
                  {property.matches?.length || 0}
                </p>
              </div>
              {property.matches && property.matches.length > 0 && (
                <>
                  <div>
                    <p className="text-sm text-dark-400">Meilleur match</p>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.max(...property.matches.map(m => m.match_score))}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Matches excellents (≥80%)</p>
                    <p className="text-2xl font-bold text-green-400">
                      {property.matches.filter(m => m.match_score >= 80).length}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
