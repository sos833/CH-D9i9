import { useState, useEffect, useRef } from 'react';
import { onSnapshot, query, collection, where, Query, CollectionReference } from 'firebase/firestore';
import type { DocumentData, QuerySnapshot } from 'firebase/firestore';

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
      (err: Error) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [qRef.current]);

  return { data, loading, error, setData };
}
