import React, { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { ConvictionVote } from '../types/market';
import { motion, AnimatePresence } from 'framer-motion';

function getDiceBearUrl(address: string) {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Group votes by marketId, option, and 10-min window
function groupVotes(votes: ConvictionVote[]) {
  const groups: any[] = [];
  votes.forEach(vote => {
    const window = Math.floor(vote.createdAt / (10 * 60 * 1000));
    const key = `${vote.marketId}-${vote.option}-${window}`;
    let group = groups.find(g => g.key === key);
    if (!group) {
      group = {
        key,
        marketId: vote.marketId,
        option: vote.option,
        amount: vote.amount,
        users: [],
        createdAt: vote.createdAt,
      };
      groups.push(group);
    }
    group.users.push(vote.user);
    group.createdAt = Math.max(group.createdAt, vote.createdAt);
    group.amount = vote.amount; // assumes all same in group
  });
  return groups;
}

const PAGE_SIZE = 10;

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ConvictionVote[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Get all markets first, then get votes from each market's subcollection
    const marketsQuery = query(collection(db, 'markets'));
    const unsub = onSnapshot(marketsQuery, (marketsSnapshot) => {
      
      // For each market, get its votes subcollection
      marketsSnapshot.docs.forEach((marketDoc) => {
        const marketId = marketDoc.id;
        const votesQuery = query(collection(db, `markets/${marketId}/votes`), orderBy('createdAt', 'desc'));
        const votesUnsub = onSnapshot(votesQuery, (votesSnapshot) => {
          const votes = votesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConvictionVote));
          
          // Update the activities state with all votes from all markets
          setActivities(prev => {
            const newVotes = [...prev.filter(v => v.marketId !== marketId), ...votes];
            return newVotes.sort((a, b) => b.createdAt - a.createdAt);
          });
        });
        
        // Clean up votes listener when component unmounts
        return () => votesUnsub();
      });
      
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const grouped = groupVotes(activities);
  const totalPages = Math.ceil(grouped.length / PAGE_SIZE);
  const paged = grouped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto mt-8">
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <motion.div key={i} className="flex items-center bg-white rounded-xl px-4 py-3 shadow gap-4" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <div className="flex -space-x-3 items-center">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 animate-pulse" />
                ))}
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence initial={false}>
            {paged.map((g) => (
              <motion.div
                key={g.key}
                className="flex items-center bg-white rounded-xl px-4 py-3 shadow gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <div className="flex -space-x-3 items-center">
                  {g.users.slice(0, 3).map((u: string, idx: number) => (
                    <img
                      key={u}
                      src={getDiceBearUrl(u)}
                      alt="user avatar"
                      className="w-8 h-8 rounded-full border-2 border-white bg-white"
                      style={{ zIndex: 10 - idx }}
                    />
                  ))}
                  {g.users.length > 3 && (
                    <span className="ml-2 text-sm text-mint-600 font-bold">+{g.users.length - 3} more</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">
                    <span className="text-mint-600 font-bold">{g.users.length} users</span> placed a bet of <span className="text-orange-500 font-bold">{g.amount} TCENT</span> on <span className={g.option === 'yes' ? 'text-mint-600' : 'text-orange-600'}>{g.option.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{timeAgo(g.createdAt)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
        </>
      )}
    </div>
  );
};

export default ActivityFeed; 