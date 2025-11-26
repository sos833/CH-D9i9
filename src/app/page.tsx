
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

  return <div>جار التحميل...</div>; // Or a proper loading spinner
}
