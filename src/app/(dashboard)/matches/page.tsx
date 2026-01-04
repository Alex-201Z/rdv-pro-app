'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { matchesApi } from '@/lib/api';
import { Match } from '@/types/real-estate';
import { Card, Button, Spinner, Badge, Input } from '@/components/ui';
import { Target, Search, TrendingUp, Users, Home, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.list();
      setMatches(response.data.matches || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des matches');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!confirm('Voulez-vous recalculer tous les scores de matching ? Cela peut prendre quelques instants.')) return;

    try {
      setLoading(true);
      await matchesApi.recalculate();
      toast.success('Recalcul des matches terminé');
      loadMatches();
    } catch (error: any) {
      toast.error('Erreur lors du recalcul');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    return 'Moyen';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-500/20 text-gray-400',
      contacted: 'bg-blue-500/20 text-blue-400',
      interested: 'bg-green-500/20 text-green-400',
      visit_scheduled: 'bg-purple-500/20 text-purple-400',
      visited: 'bg-cyan-500/20 text-cyan-400',
      not_interested: 'bg-red-500/20 text-red-400',
      offer_made: 'bg-yellow-500/20 text-yellow-400',
      sold: 'bg-green-500/20 text-green-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      contacted: 'Contacté',
      interested: 'Intéressé',
      visit_scheduled: 'Visite planifiée',
      visited: 'Visité',
      not_interested: 'Pas intéressé',
      offer_made: 'Offre faite',
      sold: 'Vendu',
    };
    return labels[status] || status;
  };

  const filteredMatches = matches
    .filter((match) => {
      // Filter by status
      if (filterStatus !== 'all' && match.status !== filterStatus) return false;

      // Filter by search term
      const search = searchTerm.toLowerCase();
      return (
        match.property?.title.toLowerCase().includes(search) ||
        match.property?.city.toLowerCase().includes(search) ||
        match.buyer?.full_name.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.match_score - a.match_score;
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const stats = {
    total: matches.length,
    excellent: matches.filter((m) => m.match_score >= 80).length,
    good: matches.filter((m) => m.match_score >= 60 && m.match_score < 80).length,
    pending: matches.filter((m) => m.status === 'pending').length,
    interested: matches.filter((m) => m.status === 'interested').length,
  };

  if (loading && matches.length === 0) {
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
            <Target className="w-7 h-7" />
            Correspondances
          </h1>
          <p className="text-dark-400 mt-1">
            {matches.length} correspondance(s) · {stats.excellent} excellent(s) · {stats.pending} en attente
          </p>
        </div>
        <Button variant="secondary" onClick={handleRecalculate} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recalculer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Excellents</p>
              <p className="text-2xl font-bold text-white">{stats.excellent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Bons</p>
              <p className="text-2xl font-bold text-white">{stats.good}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">En attente</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Intéressés</p>
              <p className="text-2xl font-bold text-white">{stats.interested}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <Input
              placeholder="Rechercher un match (propriété, acheteur, ville)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="contacted">Contacté</option>
              <option value="interested">Intéressé</option>
              <option value="visit_scheduled">Visite planifiée</option>
              <option value="visited">Visité</option>
              <option value="not_interested">Pas intéressé</option>
              <option value="offer_made">Offre faite</option>
              <option value="sold">Vendu</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
              className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="score">Par score</option>
              <option value="date">Par date</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Liste des matches */}
      {filteredMatches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? 'Aucun match trouvé' : 'Aucun match'}
            </h3>
            <p className="text-dark-400">
              {searchTerm || filterStatus !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Les correspondances apparaîtront ici quand des propriétés et acheteurs seront ajoutés'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="hover:border-primary-500/50 transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Score */}
                <div className="flex md:flex-col items-center md:items-start gap-3 md:w-32">
                  <div className={`text-center p-4 rounded-lg border ${getMatchScoreColor(match.match_score)}`}>
                    <div className="text-3xl font-bold">{match.match_score}%</div>
                    <div className="text-xs mt-1">{getMatchScoreLabel(match.match_score)}</div>
                  </div>
                </div>

                {/* Property */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/properties/${match.property_id}`}>
                        <h3 className="font-semibold text-white hover:text-primary-400 transition-colors">
                          {match.property?.title || 'Propriété'}
                        </h3>
                      </Link>
                      <Badge className={getStatusColor(match.status)}>
                        {getStatusLabel(match.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-dark-400">
                      {match.property?.city} · {match.property?.surface}m² · {match.property?.rooms} pièces
                    </p>
                    {match.property?.formatted_price && (
                      <p className="text-primary-400 font-semibold mt-2">
                        {match.property.formatted_price}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-dark-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href={`/buyers/${match.buyer_id}`}>
                          <p className="font-medium text-white hover:text-primary-400 transition-colors">
                            {match.buyer?.full_name || 'Acheteur'}
                          </p>
                        </Link>
                        {match.buyer && (
                          <div className="text-sm text-dark-400 mt-1">
                            {match.buyer.email} · {match.buyer.phone}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/buyers/${match.buyer_id}`}>
                          <Button size="sm" variant="secondary">
                            Voir acheteur
                          </Button>
                        </Link>
                        <Link href={`/properties/${match.property_id}`}>
                          <Button size="sm" variant="secondary">
                            Voir propriété
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {match.notes && (
                    <div className="pt-3 border-t border-dark-700">
                      <p className="text-sm text-dark-400">
                        <span className="font-medium">Notes:</span> {match.notes}
                      </p>
                    </div>
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
