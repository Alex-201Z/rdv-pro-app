'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sellersApi } from '@/lib/api';
import { Seller } from '@/types/real-estate';
import { Card, Button, Spinner, Badge, Input } from '@/components/ui';
import { Building2, Plus, Search, Mail, Phone, MapPin, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await sellersApi.list();
      setSellers(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des vendeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Voulez-vous vraiment archiver ce vendeur ?')) return;

    try {
      await sellersApi.archive(id);
      toast.success('Vendeur archivé');
      loadSellers();
    } catch (error: any) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const filteredSellers = sellers.filter((seller) => {
    const search = searchTerm.toLowerCase();
    return (
      seller.full_name.toLowerCase().includes(search) ||
      seller.email.toLowerCase().includes(search) ||
      seller.phone?.toLowerCase().includes(search)
    );
  });

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
            <Building2 className="w-7 h-7" />
            Vendeurs
          </h1>
          <p className="text-dark-400 mt-1">
            {sellers.length} vendeur(s) · {sellers.filter(s => s.status === 'active').length} actif(s)
          </p>
        </div>
        <Link href="/sellers/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouveau vendeur
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <Input
            placeholder="Rechercher un vendeur (nom, email, téléphone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Liste des vendeurs */}
      {filteredSellers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? 'Aucun vendeur trouvé' : 'Aucun vendeur'}
            </h3>
            <p className="text-dark-400 mb-4">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par ajouter votre premier vendeur'}
            </p>
            {!searchTerm && (
              <Link href="/sellers/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Ajouter un vendeur
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSellers.map((seller) => (
            <Card key={seller.id} className="hover:border-primary-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <Link href={`/sellers/${seller.id}`}>
                      <h3 className="font-semibold text-white hover:text-primary-400 transition-colors">
                        {seller.full_name}
                      </h3>
                    </Link>
                    <Badge className={seller.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {seller.status === 'active' ? 'Actif' : 'Archivé'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                  <Mail className="w-4 h-4 text-dark-400" />
                  <a href={`mailto:${seller.email}`} className="hover:text-primary-400 transition-colors">
                    {seller.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Phone className="w-4 h-4 text-dark-400" />
                  <a href={`tel:${seller.phone}`} className="hover:text-primary-400 transition-colors">
                    {seller.phone}
                  </a>
                </div>
                {seller.address && (
                  <div className="flex items-start gap-2 text-dark-300">
                    <MapPin className="w-4 h-4 text-dark-400 mt-0.5" />
                    <span className="line-clamp-2">{seller.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between">
                <span className="text-sm text-dark-400">
                  {seller.properties?.length || 0} propriété(s)
                </span>
                <div className="flex gap-2">
                  <Link href={`/sellers/${seller.id}`}>
                    <Button variant="secondary" size="sm">
                      Voir
                    </Button>
                  </Link>
                  {seller.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(seller.id)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
