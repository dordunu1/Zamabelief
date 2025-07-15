import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { ConvictionVote } from '../types/market';

export function useVotes(marketId: string) {
  const [votes, setVotes] = useState<ConvictionVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) return;
    const q = query(collection(db, `markets/${marketId}/votes`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setVotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConvictionVote)));
      setLoading(false);
    });
    return () => unsub();
  }, [marketId]);

  return { votes, loading };
}

export function useAllVotes() {
  const [votesByMarket, setVotesByMarket] = useState<Record<string, ConvictionVote[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We need to listen to all markets to get their votes subcollections
    const q = query(collection(db, 'markets'));
    const unsub = onSnapshot(q, (marketsSnapshot) => {
      // For each market, get its votes subcollection
      marketsSnapshot.docs.forEach((marketDoc) => {
        const marketId = marketDoc.id;
        // Listen to votes subcollection for each market
        const votesQuery = query(collection(db, `markets/${marketId}/votes`), orderBy('createdAt', 'desc'));
        const votesUnsub = onSnapshot(votesQuery, (votesSnapshot) => {
          const votes = votesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ConvictionVote));
          setVotesByMarket(prev => ({
            ...prev,
            [marketId]: votes
          }));
        });
        
        // Clean up votes listener when component unmounts
        return () => votesUnsub();
      });
      
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { votesByMarket, loading };
} 