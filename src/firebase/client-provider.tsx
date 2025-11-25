'use client';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import React, { ReactNode } from 'react';

// Initialize Firebase on the client
const { app, firestore, auth } = initializeFirebase();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
