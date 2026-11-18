'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Preloader from '../../components/Preloader';

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.id || user?._id) {
        router.push(`/profile/${user.id || user._id}`);
      } else {
        router.push('/admin');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Preloader label="Loading Profile..." description="Resolving administrator profile details" />
    </div>
  );
}

