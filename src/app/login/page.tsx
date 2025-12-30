'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button, Input, Card } from '@/components/ui';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Une erreur est survenue');
      }
    }
  };

  const handleDemoLogin = async () => {
    const email = 'pro@rdvpro.fr';
    const password = 'password';

    setEmail(email);
    setPassword(password);

    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Erreur lors de la connexion démo');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">🏡 CRM Immobilier</h1>
          <p className="text-dark-400 mt-2">
            Connexion Professionnels Immobiliers
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email?.[0]}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password?.[0]}
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-700">
            <p className="text-sm text-dark-400 text-center mb-4">
              Compte de démonstration
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => handleDemoLogin()}
            >
              Connexion Démo (Professionnel)
            </Button>
          </div>

          <p className="text-center text-dark-400 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-primary-500 hover:text-primary-400">
              Créer un compte
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
