"use client";

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, query, collection, where, Query, CollectionReference } from 'firebase/firestore';
import type { DocumentData, QuerySnapshot, FirestoreError } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(q: Query | CollectionReference | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const qRef = useRef(q);

  useEffect(() => {
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
        setData(docs);
        setLoading(false);
      },
      (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
            const path = (q as CollectionReference).path;
            const customError = new FirestorePermissionError({
                path: path,
                operation: 'list'
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
  }, [qRef.current]);

  return { data, loading, error, setData };
}
