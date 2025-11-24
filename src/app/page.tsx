
'use client';
import { useApp } from '@/context/app-context';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { storeSettings } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div>جار التحميل...</div>; // Or a proper loading spinner
  }

  if (storeSettings.initialSetupDone) {
    redirect('/dashboard');
  } else {
    redirect('/onboarding');
  }
}
