'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { sellersApi, buyersApi, propertiesApi, matchesApi } from '@/lib/api';
import { Card, Spinner, Badge } from '@/components/ui';
import { Home, Users, Building2, Target, TrendingUp, Euro, Calendar } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  sellers: {
    total: number;
    active: number;
  };
  buyers: {
    total: number;
    active: number;
  };
  properties: {
    total: number;
    available: number;
    sold: number;
    total_value: number;
  };
  matches: {
    total: number;
    excellent: number;
    pending: number;
    interested: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    sellers: { total: 0, active: 0 },
    buyers: { total: 0, active: 0 },
    properties: { total: 0, available: 0, sold: 0, total_value: 0 },
    matches: { total: 0, excellent: 0, pending: 0, interested: 0 },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [sellersRes, buyersRes, propertiesRes, matchesRes] = await Promise.all([
        sellersApi.stats().catch(() => ({ data: { total: 0, active: 0 } })),
        buyersApi.stats().catch(() => ({ data: { total: 0, active: 0 } })),
        propertiesApi.stats().catch(() => ({ data: { total: 0, available: 0, sold: 0, total_value: 0 } })),
        matchesApi.stats().catch(() => ({ data: { total: 0, high_score: 0, pending: 0, interested: 0 } })),
      ]);

      setStats({
        sellers: {
          total: sellersRes.data.total || 0,
          active: sellersRes.data.active || 0,
        },
        buyers: {
          total: buyersRes.data.total || 0,
          active: buyersRes.data.active || 0,
        },
        properties: {
          total: propertiesRes.data.total || 0,
          available: propertiesRes.data.available || 0,
          sold: propertiesRes.data.sold || 0,
          total_value: propertiesRes.data.total_value || 0,
        },
        matches: {
          total: matchesRes.data.total || 0,
          excellent: matchesRes.data.high_score || 0,
          pending: matchesRes.data.pending || 0,
          interested: matchesRes.data.interested || 0,
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-white">🏡 Tableau de Bord</h1>
        <p className="text-dark-400 mt-2">
          Bienvenue {user?.full_name || user?.first_name} - {user?.company_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendeurs */}
        <Link href="/sellers">
          <Card className="hover:border-primary-500/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Vendeurs</p>
                <p className="text-2xl font-bold text-white">{stats.sellers.total}</p>
                <p className="text-xs text-green-400">{stats.sellers.active} actifs</p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Acheteurs */}
        <Link href="/buyers">
          <Card className="hover:border-primary-500/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Acheteurs</p>
                <p className="text-2xl font-bold text-white">{stats.buyers.total}</p>
                <p className="text-xs text-green-400">{stats.buyers.active} actifs</p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Propriétés */}
        <Link href="/properties">
          <Card className="hover:border-primary-500/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Home className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Propriétés</p>
                <p className="text-2xl font-bold text-white">{stats.properties.total}</p>
                <p className="text-xs text-yellow-400">{stats.properties.available} disponibles</p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Matches */}
        <Link href="/matches">
          <Card className="hover:border-primary-500/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Correspondances</p>
                <p className="text-2xl font-bold text-white">{stats.matches.total}</p>
                <p className="text-xs text-green-400">{stats.matches.excellent} excellents</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propriétés Details */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Home className="w-5 h-5" />
              Propriétés
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Disponibles</span>
              <Badge className="bg-green-500/20 text-green-400">
                {stats.properties.available}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Vendues</span>
              <Badge className="bg-blue-500/20 text-blue-400">
                {stats.properties.sold}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <span className="text-dark-400 flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Valeur totale
              </span>
              <span className="text-xl font-bold text-primary-400">
                {stats.properties.total_value.toLocaleString()}€
              </span>
            </div>
          </div>
        </Card>

        {/* Matches Details */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Correspondances
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Excellents (≥80%)</span>
              <Badge className="bg-green-500/20 text-green-400">
                {stats.matches.excellent}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">En attente</span>
              <Badge className="bg-gray-500/20 text-gray-400">
                {stats.matches.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Intéressés</span>
              <Badge className="bg-blue-500/20 text-blue-400">
                {stats.matches.interested}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/sellers/new">
            <button className="w-full p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
              <Building2 className="w-5 h-5 text-primary-400 mb-2" />
              <p className="text-white font-medium">Nouveau vendeur</p>
              <p className="text-xs text-dark-400">Ajouter un vendeur</p>
            </button>
          </Link>

          <Link href="/buyers/new">
            <button className="w-full p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
              <Users className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-white font-medium">Nouvel acheteur</p>
              <p className="text-xs text-dark-400">Ajouter un acheteur</p>
            </button>
          </Link>

          <Link href="/properties/new">
            <button className="w-full p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
              <Home className="w-5 h-5 text-green-400 mb-2" />
              <p className="text-white font-medium">Nouvelle propriété</p>
              <p className="text-xs text-dark-400">Ajouter une propriété</p>
            </button>
          </Link>

          <Link href="/appointments/new">
            <button className="w-full p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-left">
              <Calendar className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-white font-medium">Nouveau RDV</p>
              <p className="text-xs text-dark-400">Planifier une visite</p>
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
