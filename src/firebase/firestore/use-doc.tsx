"use client";

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, DocumentReference } from 'firebase/firestore';
import type { DocumentData, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refRef = useRef(ref);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as unknown as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
            const customError = new FirestorePermissionError({
                path: ref.path,
                operation: 'get'
            });
            errorEmitter.emit('permission-error', customError);
            setError(customError);
        } else {
            console.error(err);
            setError(err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refRef.current]);

  return { data, loading, error, setData };
}
