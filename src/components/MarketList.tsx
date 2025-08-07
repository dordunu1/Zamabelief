import React, { useState } from 'react';
import { useMarkets } from '../hooks/useMarkets';
import { useAllVotes } from '../hooks/useVotes';
import MarketCard from './MarketCard';
import type { ConvictionMarket } from '../types/market';
import { motion } from 'framer-motion';

// Update props interface
type MarketListProps = {
  userAddress: string;
  address: string;
  signer?: any;
  connect?: () => void;
  connecting?: boolean;
};

const PAGE_SIZE = 9;
const TABS = [
  { label: 'Active', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
];

const MarketList: React.FC<MarketListProps> = ({ userAddress, address, signer, connect = () => {}, connecting = false }) => {
  const { markets, loading: loadingMarkets } = useMarkets();
  const { votesByMarket, loading: loadingVotes } = useAllVotes();
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [page, setPage] = useState(1);

  // Filter markets by tab
  const filteredMarkets = markets.filter(m => m.status === activeTab);
  const totalPages = Math.ceil(filteredMarkets.length / PAGE_SIZE);
  const pagedMarkets = filteredMarkets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page to 1 when tab changes
  React.useEffect(() => { setPage(1); }, [activeTab]);

  if (loadingMarkets || loadingVotes) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full max-w-6xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="rounded-xl bg-white shadow p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 animate-pulse"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="h-5 sm:h-6 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="h-3 sm:h-4 w-1/3 bg-gray-100 rounded mb-3 sm:mb-4" />
            <div className="h-20 sm:h-24 w-full bg-gray-100 rounded mb-2" />
            <div className="h-3 sm:h-4 w-1/4 bg-gray-200 rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (!markets.length) {
    return <div className="text-center py-8 sm:py-12 text-base sm:text-lg text-gray-400 px-4">No conviction markets yet. Be the first to create one!</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`px-4 py-2 rounded-lg font-bold text-base transition-all cursor-pointer ${activeTab === tab.value ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setActiveTab(tab.value as 'active' | 'resolved')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Market Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {pagedMarkets.map((market: ConvictionMarket) => (
          <MarketCard
            key={market.id}
            market={market}
            votes={votesByMarket[market.id] || []}
            userAddress={userAddress}
            address={address}
            signer={signer}
            connect={connect}
            connecting={connecting}
          />
        ))}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-600 font-bold disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          <button
            className="px-4 py-2 rounded bg-orange-500 text-white font-bold disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketList; 