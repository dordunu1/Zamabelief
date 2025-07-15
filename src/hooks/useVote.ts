import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { ConvictionVote } from '../types/market';

export function useVote() {
  const vote = async (vote: Omit<ConvictionVote, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, `markets/${vote.marketId}/votes`), {
      ...vote,
      createdAt: Date.now(),
    });
    return docRef.id;
  };
  return { vote };
} 