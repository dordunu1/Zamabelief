import React, { useState, useEffect, useRef } from 'react';
import { FaFire } from 'react-icons/fa';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { ConvictionMarket } from '../types/market';

const HeaderMarkets: React.FC = () => {
  const [markets, setMarkets] = useState<ConvictionMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const marketsRef = collection(db, 'markets');
        const q = query(marketsRef, orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const marketsData: ConvictionMarket[] = [];
        querySnapshot.forEach((doc) => {
          marketsData.push({
            id: doc.id,
            ...doc.data()
          } as ConvictionMarket);
        });
        
        setMarkets(marketsData);
      } catch (error) {
        console.error('Error fetching markets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (markets.length === 0) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      // Continue scrolling
      scrollContainer.scrollLeft += 1;
      
      // When we reach the middle (end of first set), reset to beginning seamlessly
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollContainer.scrollLeft >= halfWidth) {
        scrollContainer.scrollLeft = 0;
      }
    };

    const interval = setInterval(scroll, 50); // Scroll speed
    return () => clearInterval(interval);
  }, [markets]);



  if (loading) {
    return (
      <div className="flex-1 mx-4 overflow-hidden">
        <div className="flex gap-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl px-4 py-3 w-48">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const truncateTitle = (title: string, maxLength: number = 35) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  return (
    <div className="flex-1 mx-4 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {/* Duplicate the content for seamless loop */}
        {[...markets, ...markets].map((market, index) => (
          <div
            key={`${market.id}-${index}`}
            className="flex-shrink-0 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl px-4 py-3 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <FaFire className="text-orange-500 text-sm animate-pulse" />
              <h3 className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {truncateTitle(market.title)}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderMarkets; 