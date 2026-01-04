'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState<{
    url: boolean;
    key: boolean;
  } | null>(null);

  useEffect(() => {
    // Check for environment variables
    // Note: We only check if they are defined, NOT their values for security
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setEnvStatus({
      url: !!url && url.length > 0,
      key: !!key && key.length > 0,
    });
  }, []);

  if (!envStatus) {
    return <div className="p-8 text-center">Chargement de la configuration...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          🔍 Debug Configuration
        </h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium text-gray-700">Supabase URL</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${envStatus.url
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}>
              {envStatus.url ? 'CONFIGURÉ' : 'MANQUANT'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium text-gray-700">Supabase Anon Key</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${envStatus.key
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}>
              {envStatus.key ? 'CONFIGURÉ' : 'MANQUANT'}
            </span>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">ℹ️ Note pour le déploiement :</p>
          <p>
            Si vous voyez <span className="text-red-600 font-bold">MANQUANT</span>,
            vous devez ajouter ces variables dans votre interface Hostinger.
          </p>
        </div>
      </Card>
    </div>
  );
}
