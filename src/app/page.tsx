
'use client';
import { useApp } from '@/context/app-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { storeSettings, loading } = useApp();

  useEffect(() => {
    if (!loading) {
      if (storeSettings?.initialSetupDone) {
        redirect('/dashboard');
      } else {
        redirect('/onboarding');
      }
    }
  }, [storeSettings, loading]);

  // Show a loading state while settings are being fetched.
  return (
    <div className="flex h-screen items-center justify-center">
      <p>جار التحميل...</p>
    </div>
  );
}

    