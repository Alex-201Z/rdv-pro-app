'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api';
import { Property } from '@/types/real-estate';
import { Card, Button, Spinner, Badge, Input } from '@/components/ui';
import { Home, Plus, Search, MapPin, Maximize, Users as UsersIcon, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesApi.list();
      setProperties(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const search = searchTerm.toLowerCase();
    return (
      property.title.toLowerCase().includes(search) ||
      property.city.toLowerCase().includes(search) ||
      property.address?.toLowerCase().includes(search)
    );
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="w-7 h-7" />
            Propriétés
          </h1>
          <p className="text-dark-400 mt-1">
            {properties.length} propriété(s) · {properties.filter(p => p.status === 'available').length} disponible(s)
          </p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouvelle propriété
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <Input
            placeholder="Rechercher une propriété (titre, ville, adresse)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Liste des propriétés */}
      {filteredProperties.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? 'Aucune propriété trouvée' : 'Aucune propriété'}
            </h3>
            <p className="text-dark-400 mb-4">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par ajouter votre première propriété'}
            </p>
            {!searchTerm && (
              <Link href="/properties/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Ajouter une propriété
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
            const featuredPhoto = property.featured_photo || (Array.isArray(property.photos) && property.photos[0]);

            return (
              <Card key={property.id} className="hover:border-primary-500/50 transition-all overflow-hidden p-0">
                {/* Photo */}
                {featuredPhoto ? (
                  <Link href={`/properties/${property.id}`}>
                    <div className="relative h-48 bg-dark-800 overflow-hidden group">
                      <img
                        src={`${baseUrl}/storage/${featuredPhoto}`}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusColor(property.status)}>
                          {getStatusLabel(property.status)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative h-48 bg-dark-800 flex items-center justify-center">
                    <Home className="w-12 h-12 text-dark-600" />
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(property.status)}>
                        {getStatusLabel(property.status)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <Link href={`/properties/${property.id}`}>
                      <h3 className="font-semibold text-lg text-white hover:text-primary-400 transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                  </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-dark-300">
                  <MapPin className="w-4 h-4 text-dark-400" />
                  <span>{property.city}</span>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Maximize className="w-4 h-4 text-dark-400" />
                  <span>{property.surface}m² · {property.rooms} pièces · {property.bedrooms} ch.</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-primary-400">
                  {property.formatted_price}
                </p>
              </div>

              {property.description && (
                <p className="text-sm text-dark-400 line-clamp-2 mb-4">
                  {property.description}
                </p>
              )}

                  <div className="pt-4 border-t border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                      <UsersIcon className="w-4 h-4" />
                      <span>{property.matches?.length || 0} match(s)</span>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                      <Button variant="secondary" size="sm">
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
