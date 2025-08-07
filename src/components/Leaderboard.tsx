import React, { useEffect, useState } from 'react';
import { onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { ConvictionVote } from '../types/market';
import { motion, AnimatePresence } from 'framer-motion';

function getDiceBearUrl(address: string) {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;
}

function shortAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

const PAGE_SIZE = 10;

const Leaderboard: React.FC = () => {
  const [userStats, setUserStats] = useState<{ address: string; votes: number }[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Get all markets first, then get votes from each market's subcollection
    const marketsQuery = query(collection(db, 'markets'));
    const unsub = onSnapshot(marketsQuery, (marketsSnapshot) => {
      const userMarkets: Record<string, Set<string>> = {};
      
      // For each market, get its votes subcollection
      marketsSnapshot.docs.forEach((marketDoc) => {
        const marketId = marketDoc.id;
        const votesQuery = query(collection(db, `markets/${marketId}/votes`));
        const votesUnsub = onSnapshot(votesQuery, (votesSnapshot) => {
          votesSnapshot.docs.forEach(doc => {
        const vote = doc.data() as ConvictionVote;
        if (!userMarkets[vote.user]) userMarkets[vote.user] = new Set();
        userMarkets[vote.user].add(vote.marketId);
      });
          
          // Update user stats
      const arr = Object.entries(userMarkets).map(([address, markets]) => ({ address, votes: markets.size }));
      arr.sort((a, b) => b.votes - a.votes);
      setUserStats(arr);
        });
        
        // Clean up votes listener when component unmounts
        return () => votesUnsub();
      });
      
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalPages = Math.ceil(userStats.length / PAGE_SIZE);
  const leaders = userStats.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-4 text-left font-bold text-gray-700">Rank</th>
              <th className="py-4 px-4 text-left font-bold text-gray-700">User</th>
              <th className="py-4 px-4 text-left font-bold flex items-center gap-2 text-orange-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Bets
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(PAGE_SIZE)].map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-mint-200 bg-gray-200 animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : (
              <AnimatePresence initial={false}>
                {leaders.map((u, i) => (
                  <motion.tr
                    key={u.address}
                    className={`border-b border-gray-100 ${i < 3 ? 'bg-mint-50' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                  >
                    <td className="py-4 px-4 font-bold text-lg text-mint-600">
                                              <div className="flex items-center gap-2">
                          {i === 0 ? (
                            <span className="text-yellow-500 text-xl">🥇</span>
                          ) : i === 1 ? (
                            <span className="text-gray-400 text-xl">🥈</span>
                          ) : i === 2 ? (
                            <span className="text-orange-500 text-xl">🥉</span>
                          ) : i === 3 ? (
                            <span className="text-blue-500 text-xl">4️⃣</span>
                          ) : i === 4 ? (
                            <span className="text-purple-500 text-xl">5️⃣</span>
                          ) : (
                            <span>{(page - 1) * PAGE_SIZE + i + 1}</span>
                          )}
                        </div>
                    </td>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img src={getDiceBearUrl(u.address)} alt="avatar" className="w-8 h-8 rounded-full border border-mint-200" />
                      <span className="font-mono text-sm">{shortAddr(u.address)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg transform hover:scale-105 transition-transform duration-200 ${
                        i === 0 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' 
                          : i === 1 
                          ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' 
                          : i === 2 
                          ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' 
                          : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      }`}>
                        {u.votes} bets
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4">
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
    </div>
  );
};

export default Leaderboard; 