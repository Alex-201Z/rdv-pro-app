'use client';

import { useEffect, useState } from 'react';
import { servicesApi } from '@/lib/api';
import { Service } from '@/types';
import { Card, Button, Modal, Input, Textarea, Spinner, Badge } from '@/components/ui';
import { Plus, Edit, Trash2, Clock, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    color: '#3B82F6',
    buffer_before: 0,
    buffer_after: 0,
    is_active: true,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; service: Service | null }>({
    open: false,
    service: null,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.list();
      setServices(response.data.services);
    } catch (error) {
      toast.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        color: service.color,
        buffer_before: service.buffer_before,
        buffer_after: service.buffer_after,
        is_active: service.is_active,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        color: '#3B82F6',
        buffer_before: 0,
        buffer_after: 0,
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, formData);
        toast.success('Service mis à jour');
      } else {
        await servicesApi.create(formData);
        toast.success('Service créé');
      }
      setModalOpen(false);
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.service) return;
    try {
      await servicesApi.delete(deleteModal.service.id);
      toast.success('Service supprimé');
      setDeleteModal({ open: false, service: null });
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const colors = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services Immobiliers</h1>
          <p className="text-dark-400">Gérez vos types de rendez-vous (visites, expertises, etc.)</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Ajouter un service
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : services.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <p className="text-dark-400 mb-4">Aucun service créé</p>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Créer votre premier service
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: service.color }} />
              <div className="pt-2">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    {!service.is_active && <Badge variant="warning" className="mt-1">Inactif</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openModal(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, service })}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
                {service.description && (
                  <p className="text-dark-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center gap-1 text-dark-400 pt-3 border-t border-dark-700">
                  <Clock className="w-4 h-4" />
                  <span>{service.formatted_duration}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingService ? 'Modifier le service' : 'Nouveau service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom du service" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Visite de bien, Expertise, etc." />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Description du service immobilier..." />
          <Input label="Durée (min)" type="number" min={15} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} required />
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button key={color} type="button" className={`w-8 h-8 rounded-lg ${formData.color === color ? 'ring-2 ring-white scale-110' : ''}`} style={{ backgroundColor: color }} onClick={() => setFormData({ ...formData, color })} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="rounded" />
            <label htmlFor="is_active" className="text-dark-300">Service actif</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" className="flex-1">{editingService ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, service: null })} title="Supprimer le service">
        <div className="space-y-4">
          <p className="text-dark-300">Supprimer "{deleteModal.service?.name}" ? Cette action est irréversible.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal({ open: false, service: null })}>Annuler</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
