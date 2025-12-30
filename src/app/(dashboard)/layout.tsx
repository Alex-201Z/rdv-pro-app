'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Layout from '@/components/Layout';
import { LoadingScreen } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchUser().then(() => setInitialized(true));
  }, [fetchUser]);

  useEffect(() => {
    if (initialized && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isLoading, isAuthenticated, router]);

  if (!initialized || isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return <Layout>{children}</Layout>;
}
