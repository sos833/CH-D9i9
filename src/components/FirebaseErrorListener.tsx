'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = (error: FirestorePermissionError) => {
      console.error(error); // Log the full contextual error to the console
      toast({
        variant: 'destructive',
        title: 'خطأ في الأذونات',
        description: 'ليس لديك الإذن للقيام بهذا الإجراء. تحقق من قواعد أمان Firestore.',
        duration: 9000,
      });

      // In a real app, you might also send this to a logging service.
    };

    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.off('permission-error', handler);
    };
  }, [toast]);

  return null; // This component does not render anything
}
