'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuthStore } from '@/stores/supabase-auth';
import Layout from '@/components/Layout';
import { LoadingScreen } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchSession } = useSupabaseAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchSession().then(() => setInitialized(true));
  }, [fetchSession]);

  useEffect(() => {
    console.log('DashboardLayout check:', { initialized, isLoading, isAuthenticated });
    if (initialized && !isLoading && !isAuthenticated) {
      console.log('Redirecting to login...');
      router.push('/login');
    }
  }, [initialized, isLoading, isAuthenticated, router]);

  // Temporary Debug: Allow rendering even if loading, just show spinner overlay or log
  if (!initialized || isLoading) {
    console.log('Rendering LoadingScreen...', { initialized, isLoading });
    return <LoadingScreen />;
  }

  // Allow rendering if we think we might be auth-ed (or if check failed but we want to see UI)
  if (!isAuthenticated && initialized) {
    // Should have redirected, but if not, show message
    return <div>Not Authenticated. Redirecting...</div>;
  }

  return <Layout>{children}</Layout>;
}
