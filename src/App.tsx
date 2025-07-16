// NOTE: Make sure to install react-router-dom with: npm install react-router-dom
import { useEffect, useState } from 'react';
import { Modal, type ModalData } from './components/Modal';
import { ethers } from 'ethers';
import LandingHero from './components/LandingHero';
import CreateMarketModal from './components/CreateMarketModal';
import MarketList from './components/MarketList';
import { FaGavel, FaChartBar, FaBolt, FaMedal } from 'react-icons/fa';
import { useCreateMarket } from './hooks/useCreateMarket';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import ActivityFeed from './components/ActivityFeed';
import Leaderboard from './components/Leaderboard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, } from 'wagmi';
import { initializeFheInstance } from './utils/fheInstance';

function App() {
  // Remove all custom wallet state/logic
  const { address: userAddress, isConnected } = useAccount();
 
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
 
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const [showLanding, setShowLanding] = useState(location.pathname === '/');
  const [error, setError] = useState<string>('');
  const { createMarket } = useCreateMarket();

  useEffect(() => {
    initializeFheInstance()
      .then((fhe) => console.log('FHEVM initialized:', fhe))
      .catch((err) => console.error('FHEVM init failed:', err));
  }, []);

  
  const checkWalletSession = async () => {
    return isConnected && !!userAddress;
  };

  function MainContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;
    return (
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
        {/* Tab bar */}
        <div className="flex items-center justify-between mb-2 mt-2">
          <div className="flex gap-1 sm:gap-4 overflow-x-auto">
            <Link
              to="/markets"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap ${path === '/markets' ? 'bg-white shadow text-mint-700' : 'bg-gray-100 text-gray-400 hover:text-mint-600'} cursor-pointer`}
            >
              <FaChartBar className="text-base sm:text-lg" /> <span className="hidden sm:inline">Markets</span>
            </Link>
            <Link
              to="/activities"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap ${path === '/activities' ? 'bg-white shadow text-mint-700' : 'bg-gray-100 text-gray-400 hover:text-mint-600'} cursor-pointer`}
            >
              <FaBolt className="text-base sm:text-lg" /> <span className="hidden sm:inline">Activities</span>
            </Link>
            <Link
              to="/leaderboard"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap ${path === '/leaderboard' ? 'bg-white shadow text-mint-700' : 'bg-gray-100 text-gray-400 hover:text-mint-600'} cursor-pointer`}
            >
              <FaMedal className="text-base sm:text-lg" /> <span className="hidden sm:inline">Leaderboard</span>
            </Link>
          </div>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 sm:px-6 rounded-lg shadow transition cursor-pointer text-xs sm:text-sm"
            style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
            onClick={() => { setShowLanding(true); navigate('/'); }}
          >
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </button>
        </div>
        {/* Main content under tabs */}
        <Routes>
          <Route path="/markets" element={
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-mint-700 mb-4 mt-0">Conviction Markets</h1>
              <MarketList
                userAddress={userAddress || ''}
                address={userAddress || ''}
                signer={signer}
              />
            </>
          } />
          <Route path="/activities" element={<ActivityFeed />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/markets" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <>
      {/* Header with Connect Wallet button at top right */}
      <header className="w-screen flex justify-between items-center px-4 sm:px-8 py-3 sm:py-4 bg-white shadow fixed top-0 left-0 z-10">
        <div className="flex items-center gap-1 sm:gap-2 cursor-pointer select-none" onClick={() => setShowLanding(true)}>
          <FaGavel className="text-orange-500 text-xl sm:text-2xl drop-shadow" />
          <span className="text-lg sm:text-2xl font-extrabold text-mint-700 tracking-tight drop-shadow-sm">Conviction App</span>
        </div>
        <div className="flex gap-1 sm:gap-2 items-center">
          <ConnectButton showBalance={false} accountStatus="address" />
        </div>
      </header>
      {/* Add padding top to main content to avoid overlap with fixed header */}
      <div className="flex flex-col items-center min-h-screen w-full bg-gray-50 p-2 sm:p-4 pt-16 sm:pt-20 overflow-x-hidden">
        {showLanding ? (
          <LandingHero
            onCreate={async () => {
              if (!userAddress || !isConnected) {
                setError('Wallet not connected. Please connect your wallet.');
                return;
              }
              const valid = await checkWalletSession();
              if (!valid) {
                setError('Wallet session expired. Please reconnect your wallet.');
                return;
              }
              setShowCreateModal(true);
            }}
            onBrowse={() => setShowLanding(false)}
          />
        ) : (
          <MainContent />
        )}
        <CreateMarketModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            if (!userAddress) return;
            await createMarket({
              ...data,
              creator: userAddress,
              createdAt: Date.now(),
              status: 'active',
            });
            setShowCreateModal(false);
            setShowLanding(false);
          }}
          address={userAddress || ''}
          signer={signer}
        />
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
      </div>
      <Modal
        isOpen={modalData !== null} 
        onClose={() => setModalData(null)} 
        title={modalData?.title ?? ''}
        message={modalData?.message ?? ''}
        isSuccess={modalData?.isSuccess ?? false}
      />
    </>
  );
}

export default App;
