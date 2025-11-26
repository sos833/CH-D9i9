
'use client';
import { useApp } from '@/context/app-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { storeSettings, loadingSettings } = useApp();

  useEffect(() => {
    if (!loadingSettings) {
      if (storeSettings?.initialSetupDone) {
        redirect('/dashboard');
      } else {
        redirect('/onboarding');
      }
    }
  }, [storeSettings, loadingSettings]);

  // Show a loading state while settings are being fetched.
  return (
    <div className="flex h-screen items-center justify-center">
      <p>جار التحميل...</p>
    </div>
  );
}
