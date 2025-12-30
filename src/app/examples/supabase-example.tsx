'use client';

import { useState, useEffect } from 'react';
import { dbHelpers, storageHelpers } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Exemple de composant utilisant Supabase pour gérer les propriétés
export default function SupabaseExample() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les propriétés au montage du composant
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await dbHelpers.getAll('properties');

    if (error) {
      setError(error.message);
      console.error('Erreur lors du chargement des propriétés:', error);
    } else {
      setProperties(data || []);
    }

    setLoading(false);
  };

  const handleCreateProperty = async () => {
    const newProperty = {
      title: 'Nouvelle propriété',
      description: 'Description de la propriété',
      price: 250000,
      address: '123 Rue Example',
      city: 'Paris',
      property_type: 'apartment',
      status: 'available',
    };

    const { data, error } = await dbHelpers.create('properties', newProperty);

    if (error) {
      setError(error.message);
      console.error('Erreur lors de la création:', error);
    } else {
      console.log('Propriété créée:', data);
      loadProperties(); // Recharger la liste
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const filePath = `photos/${Date.now()}-${file.name}`;

    const { data, error } = await storageHelpers.uploadFile(
      'property-images',
      filePath,
      file
    );

    if (error) {
      setError(error.message);
      console.error('Erreur lors de l\'upload:', error);
    } else {
      const publicUrl = storageHelpers.getPublicUrl('property-images', filePath);
      console.log('Fichier uploadé, URL:', publicUrl);
    }
  };

  const handleSignIn = async () => {
    const { error } = await signIn('user@example.com', 'password123');
    if (error) {
      setError(error.message);
    }
  };

  if (authLoading) {
    return <div>Chargement de l'authentification...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Exemple d'utilisation Supabase</h1>

      {/* Section Authentification */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Authentification</h2>
        {user ? (
          <div>
            <p>Connecté en tant que: {user.email}</p>
            <button
              onClick={() => signOut()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <div>
            <p>Non connecté</p>
            <button
              onClick={handleSignIn}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Se connecter (exemple)
            </button>
          </div>
        )}
      </div>

      {/* Section Base de données */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Propriétés</h2>
        <button
          onClick={loadProperties}
          disabled={loading}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Chargement...' : 'Recharger'}
        </button>
        <button
          onClick={handleCreateProperty}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Créer une propriété
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            Erreur: {error}
          </div>
        )}

        <div className="mt-4">
          <p className="font-medium">Nombre de propriétés: {properties.length}</p>
          {properties.length > 0 && (
            <ul className="mt-2 space-y-2">
              {properties.map((property) => (
                <li key={property.id} className="p-2 bg-white rounded shadow">
                  <p className="font-semibold">{property.title}</p>
                  <p className="text-sm text-gray-600">{property.city} - {property.price}€</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Section Upload de fichiers */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Upload de fichiers</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          accept="image/*"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Assurez-vous d'avoir créé les tables dans Supabase</li>
          <li>Configurez les politiques RLS pour la sécurité</li>
          <li>Créez un bucket "property-images" pour le stockage</li>
          <li>Adaptez le code selon votre schéma de base de données</li>
        </ul>
      </div>
    </div>
  );
}
