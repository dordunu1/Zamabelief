import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { ConvictionMarket } from '../types/market';

export function useCreateMarket() {
  const createMarket = async (market: Omit<ConvictionMarket, 'id' | 'createdAt'> & { betId: string }) => {
    const docRef = await addDoc(collection(db, 'markets'), {
      ...market,
      betId: market.betId,
      createdAt: Date.now(),
      status: 'active',
    });
    return docRef.id;
  };
  return { createMarket };
} 