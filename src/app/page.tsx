'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuthStore } from '@/stores/supabase-auth';
import { LoadingScreen } from '@/components/ui';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchSession } = useSupabaseAuthStore();

  useEffect(() => {
    fetchSession().then(() => {
      // Redirection gérée après le fetch
    });
  }, [fetchSession]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return <LoadingScreen />;
}
