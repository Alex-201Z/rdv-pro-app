'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api';
import { Card, Button, Input } from '@/components/ui';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    sms_notifications: user?.sms_notifications ?? true,
    email_notifications: user?.email_notifications ?? true,
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await authApi.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await authApi.changePassword(passwords);
      toast.success('Mot de passe modifié');
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Mon profil</h1>
        <p className="text-dark-400">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Informations personnelles</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
            <Input label="Nom" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
          </div>
          <Input label="Email" value={user?.email || ''} disabled />
          <Input label="Téléphone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          {user?.role === 'professional' && (
            <>
              <Input label="Entreprise" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
              <Input label="Adresse" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ville" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                <Input label="Code postal" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="email_notif" checked={formData.email_notifications} onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })} className="rounded" />
              <label htmlFor="email_notif" className="text-dark-300">Recevoir les notifications par email</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sms_notif" checked={formData.sms_notifications} onChange={(e) => setFormData({ ...formData, sms_notifications: e.target.checked })} className="rounded" />
              <label htmlFor="sms_notif" className="text-dark-300">Recevoir les notifications par SMS</label>
            </div>
          </div>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4" />
            Enregistrer
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Changer le mot de passe</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Mot de passe actuel" type="password" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} required />
          <Input label="Nouveau mot de passe" type="password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} required />
          <Input label="Confirmer" type="password" value={passwords.password_confirmation} onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })} required />
          <Button type="submit">Changer le mot de passe</Button>
        </form>
      </Card>
    </div>
  );
}
