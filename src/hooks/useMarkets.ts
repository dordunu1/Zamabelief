import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { ConvictionMarket } from '../types/market';

export function useMarkets() {
  const [markets, setMarkets] = useState<ConvictionMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'markets'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMarkets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConvictionMarket)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { markets, loading };
} 