'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button, Input, Select, Card } from '@/components/ui';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    company_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await register(formData);
      toast.success('Inscription réussie !');
      router.push('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          apiErrors[key] = (value as string[])[0];
        });
        setErrors(apiErrors);
      } else {
        toast.error('Une erreur est survenue');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">🏡 CRM Immobilier</h1>
          <p className="text-dark-400 mt-2">
            Inscription Professionnels Immobiliers
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                name="first_name"
                placeholder="Jean"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />
              <Input
                label="Nom"
                name="last_name"
                placeholder="Dupont"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="votre@email.fr"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Téléphone"
              type="tel"
              name="phone"
              placeholder="+33 6 12 34 56 78"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />

            <Input
              label="Nom de l'agence"
              name="company_name"
              placeholder="Agence Immobilière Dubois"
              value={formData.company_name}
              onChange={handleChange}
              error={errors.company_name}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="password_confirmation"
              placeholder="••••••••"
              value={formData.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-dark-400 mt-6">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-400">
              Se connecter
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
