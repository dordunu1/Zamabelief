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
      setMarkets(snapshot.docs.map(doc => {
        const data = doc.data();
        // Compute expiresAt in ms if expiry and createdAt are present
        let expiresAt = data.expiresAt;
        if (data.expiry && data.createdAt) {
          // If createdAt is in seconds, convert to ms
          const createdAtMs = data.createdAt > 1e12 ? data.createdAt : data.createdAt * 1000;
          expiresAt = createdAtMs + data.expiry * 1000;
        }
        return { id: doc.id, ...data, expiresAt } as ConvictionMarket;
      }));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { markets, loading };
} 