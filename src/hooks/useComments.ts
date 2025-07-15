import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export interface MarketComment {
  id?: string;
  user: string;
  text: string;
  createdAt: number;
}

export function useComments(marketId: string) {
  const [comments, setComments] = useState<MarketComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) return;
    const q = query(collection(db, `markets/${marketId}/comments`), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketComment)));
      setLoading(false);
    });
    return () => unsub();
  }, [marketId]);

  const addComment = async (user: string, text: string) => {
    await addDoc(collection(db, `markets/${marketId}/comments`), {
      user,
      text,
      createdAt: Date.now(),
    });
  };

  return { comments, loading, addComment };
} 