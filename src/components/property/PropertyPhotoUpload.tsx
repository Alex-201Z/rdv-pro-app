'use client';

import { useState } from 'react';
import { Property } from '@/types/real-estate';
import { Button, Spinner } from '@/components/ui';
import { Upload, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface PropertyPhotoUploadProps {
  property: Property;
  onUpdate: () => void;
}

const CATEGORIES = [
  { value: 'general', label: 'Général' },
  { value: 'exterior', label: 'Extérieur' },
  { value: 'living_room', label: 'Salon' },
  { value: 'kitchen', label: 'Cuisine' },
  { value: 'bedroom', label: 'Chambre' },
  { value: 'bathroom', label: 'Salle de bain' },
  { value: 'garden', label: 'Jardin' },
  { value: 'terrace', label: 'Terrasse' },
  { value: 'parking', label: 'Parking' },
  { value: 'other', label: 'Autre' },
];

export default function PropertyPhotoUpload({ property, onUpdate }: PropertyPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille maximale est 5 MB');
      return;
    }

    setSelectedFile(file);
    setShowUploadForm(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('category', category);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (estimatedPrice) formData.append('estimated_price', estimatedPrice);

    try {
      setUploading(true);
      await api.post(`/properties/${property.id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo ajoutée avec succès');
      onUpdate();

      // Reset form
      setSelectedFile(null);
      setShowUploadForm(false);
      setCategory('general');
      setTitle('');
      setDescription('');
      setEstimatedPrice('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setShowUploadForm(false);
    setCategory('general');
    setTitle('');
    setDescription('');
    setEstimatedPrice('');
  };

  const handleDelete = async (photoPath: string) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      setDeletingPhoto(photoPath);
      await api.delete(`/properties/${property.id}/photos`, {
        data: { photo: photoPath },
      });
      toast.success('Photo supprimée');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingPhoto(null);
    }
  };

  const handleSetFeatured = async (photoPath: string) => {
    try {
      await api.post(`/properties/${property.id}/photos/featured`, {
        photo: photoPath,
      });
      toast.success('Photo à la une définie');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const photos = Array.isArray(property.photos) ? property.photos : [];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {!showUploadForm && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="inline-block">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary-500 text-white hover:bg-primary-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              Ajouter une photo
            </div>
          </label>
          <p className="text-xs text-dark-400 mt-1">
            Formats: JPG, PNG, WebP - Max: 5 MB
          </p>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && selectedFile && (
        <div className="bg-dark-800 p-4 rounded-lg border border-dark-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Détails de la photo</h3>
            <button
              onClick={handleCancelUpload}
              className="text-dark-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          <div className="relative w-full h-48 bg-dark-900 rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Catégorie *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vue sur le jardin"
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder:text-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez une description..."
              rows={3}
              className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder:text-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Estimated Price */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Prix estimé (optionnel)
            </label>
            <div className="relative">
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 pr-8 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder:text-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">€</span>
            </div>
            <p className="text-xs text-dark-400 mt-1">
              Prix estimé pour cette photo dans le cadre d'une estimation du bien
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter la photo
                </>
              )}
            </Button>
            <Button
              onClick={handleCancelUpload}
              variant="secondary"
              disabled={uploading}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative group bg-dark-800 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={`${baseUrl}/storage/${photo}`}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleSetFeatured(photo)}
                  disabled={property.featured_photo === photo}
                  className={`p-2 rounded-lg transition-colors ${
                    property.featured_photo === photo
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-white hover:bg-primary-500'
                  }`}
                  title="Définir comme photo à la une"
                >
                  <Star className="w-4 h-4" fill={property.featured_photo === photo ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={() => handleDelete(photo)}
                  disabled={deletingPhoto === photo}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Supprimer"
                >
                  {deletingPhoto === photo ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Featured Badge */}
              {property.featured_photo === photo && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3" fill="currentColor" />
                  À la une
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-800 rounded-lg border border-dark-700 border-dashed">
          <Upload className="w-12 h-12 text-dark-500 mx-auto mb-3" />
          <p className="text-dark-400">Aucune photo pour ce bien</p>
          <p className="text-sm text-dark-500 mt-1">Ajoutez des photos pour améliorer la présentation</p>
        </div>
      )}
    </div>
  );
}
