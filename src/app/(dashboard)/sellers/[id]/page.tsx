'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { sellersApi } from '@/lib/api';
import { Seller } from '@/types/real-estate';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Home,
  Edit,
  Archive,
  Trash2,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadSeller();
    }
  }, [params.id]);

  const loadSeller = async () => {
    try {
      setLoading(true);
      const response = await sellersApi.get(Number(params.id));
      setSeller(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
      router.push('/sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!seller || !confirm('Voulez-vous vraiment archiver ce vendeur ?')) return;

    try {
      await sellersApi.archive(seller.id);
      toast.success('Vendeur archivé');
      router.push('/sellers');
    } catch (error: any) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const handleDelete = async () => {
    if (!seller || !confirm('Voulez-vous vraiment supprimer ce vendeur ? Cette action est irréversible.')) return;

    try {
      await sellersApi.delete(seller.id);
      toast.success('Vendeur supprimé');
      router.push('/sellers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sellers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-7 h-7" />
              {seller.full_name}
            </h1>
            <p className="text-dark-400 mt-1">
              Vendeur #{seller.id} · Ajouté le {new Date(seller.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/sellers/${seller.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          </Link>
          {seller.status === 'active' && (
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
              <Badge className={seller.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                {seller.status === 'active' ? 'Actif' : 'Archivé'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-sm text-dark-400">Email</p>
                  <a href={`mailto:${seller.email}`} className="text-white hover:text-primary-400 transition-colors">
                    {seller.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-dark-400 mt-0.5" />
                <div>
                  <p className="text-sm text-dark-400">Téléphone</p>
                  <a href={`tel:${seller.phone}`} className="text-white hover:text-primary-400 transition-colors">
                    {seller.phone}
                  </a>
                </div>
              </div>

              {seller.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-dark-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-dark-400">Adresse</p>
                    <p className="text-white">{seller.address}</p>
                  </div>
                </div>
              )}

              {seller.notes && (
                <div className="pt-4 border-t border-dark-700">
                  <p className="text-sm text-dark-400 mb-2">Notes</p>
                  <p className="text-white whitespace-pre-wrap">{seller.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Informations du Projet */}
          {(seller.project_start_date || seller.open_to_offmarket) && (
            <Card>
              <h2 className="text-lg font-semibold text-white mb-4">Informations du Projet</h2>
              <div className="space-y-3">
                {seller.project_start_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-sm text-dark-400">Date de début de projet</p>
                      <p className="text-white">{new Date(seller.project_start_date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                )}
                {seller.open_to_offmarket && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white">Ouvert aux propositions off-market</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Propriétés */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Home className="w-5 h-5" />
                Propriétés ({seller.properties?.length || 0})
              </h2>
              <Link href="/properties/new">
                <Button size="sm">Ajouter une propriété</Button>
              </Link>
            </div>

            {seller.properties && seller.properties.length > 0 ? (
              <div className="space-y-3">
                {seller.properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="block p-4 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors border border-dark-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{property.title}</h3>
                        <p className="text-sm text-dark-400 mt-1">
                          {property.city} · {property.surface}m² · {property.rooms} pièces
                        </p>
                        <p className="text-primary-400 font-semibold mt-2">
                          {property.formatted_price}
                        </p>
                      </div>
                      <Badge className={`status-${property.status}`}>
                        {property.status === 'available' && 'Disponible'}
                        {property.status === 'under_offer' && 'Sous offre'}
                        {property.status === 'sold' && 'Vendue'}
                        {property.status === 'archived' && 'Archivée'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                <p className="text-dark-400 mb-4">Aucune propriété pour ce vendeur</p>
                <Link href="/properties/new">
                  <Button size="sm">Ajouter une propriété</Button>
                </Link>
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
                <p className="text-sm text-dark-400">Propriétés actives</p>
                <p className="text-2xl font-bold text-white">
                  {seller.properties?.filter(p => p.status === 'available').length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Propriétés vendues</p>
                <p className="text-2xl font-bold text-green-400">
                  {seller.properties?.filter(p => p.status === 'sold').length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Total propriétés</p>
                <p className="text-2xl font-bold text-white">
                  {seller.properties?.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
