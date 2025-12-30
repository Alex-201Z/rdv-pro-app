'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buyersApi } from '@/lib/api';
import { Buyer } from '@/types/real-estate';
import { Card, Button, Spinner, Badge, Input } from '@/components/ui';
import { Users, Plus, Search, Mail, Phone, Archive, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const response = await buyersApi.list();
      setBuyers(response.data.data || response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des acheteurs');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Voulez-vous vraiment archiver cet acheteur ?')) return;

    try {
      await buyersApi.archive(id);
      toast.success('Acheteur archivé');
      loadBuyers();
    } catch (error: any) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const search = searchTerm.toLowerCase();
    return (
      buyer.full_name.toLowerCase().includes(search) ||
      buyer.email.toLowerCase().includes(search) ||
      buyer.phone?.toLowerCase().includes(search)
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
            <Users className="w-7 h-7" />
            Acheteurs
          </h1>
          <p className="text-dark-400 mt-1">
            {buyers.length} acheteur(s) · {buyers.filter(b => b.status === 'active').length} actif(s)
          </p>
        </div>
        <Link href="/buyers/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouvel acheteur
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <Input
            placeholder="Rechercher un acheteur (nom, email, téléphone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Liste des acheteurs */}
      {filteredBuyers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? 'Aucun acheteur trouvé' : 'Aucun acheteur'}
            </h3>
            <p className="text-dark-400 mb-4">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par ajouter votre premier acheteur'}
            </p>
            {!searchTerm && (
              <Link href="/buyers/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Ajouter un acheteur
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id} className="hover:border-primary-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <Link href={`/buyers/${buyer.id}`}>
                      <h3 className="font-semibold text-white hover:text-primary-400 transition-colors">
                        {buyer.full_name}
                      </h3>
                    </Link>
                    <Badge className={buyer.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {buyer.status === 'active' ? 'Actif' : 'Archivé'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                  <Mail className="w-4 h-4 text-dark-400" />
                  <a href={`mailto:${buyer.email}`} className="hover:text-primary-400 transition-colors">
                    {buyer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-dark-300">
                  <Phone className="w-4 h-4 text-dark-400" />
                  <a href={`tel:${buyer.phone}`} className="hover:text-primary-400 transition-colors">
                    {buyer.phone}
                  </a>
                </div>
                {buyer.criteria && buyer.criteria.length > 0 && (
                  <div className="flex items-center gap-2 text-dark-300">
                    <Target className="w-4 h-4 text-dark-400" />
                    <span>{buyer.criteria.length} critère(s) de recherche</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between">
                <span className="text-sm text-dark-400">
                  {buyer.matches?.length || 0} match(s)
                </span>
                <div className="flex gap-2">
                  <Link href={`/buyers/${buyer.id}`}>
                    <Button variant="secondary" size="sm">
                      Voir
                    </Button>
                  </Link>
                  {buyer.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(buyer.id)}
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
