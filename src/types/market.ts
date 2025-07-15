export type MarketStatus = 'active' | 'expired' | 'resolved';

export interface ConvictionMarket {
  id: string;
  betId: string;
  title: string;
  description: string;
  creator: string;
  minBet: number;
  expiresAt: number; // timestamp
  status: MarketStatus;
  options: [string, string]; // Yes/No
  createdAt: number;
}

export interface ConvictionVote {
  id: string;
  marketId: string;
  user: string;
  option: 'yes' | 'no';
  amount: number;
  createdAt: number;
} 