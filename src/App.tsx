// NOTE: Make sure to install react-router-dom with: npm install react-router-dom
import React, { useState } from 'react';
import { Modal, type ModalData } from './components/Modal';
import { ethers } from 'ethers';
import LandingHero from './components/LandingHero';
import CreateMarketModal from './components/CreateMarketModal';
import MarketList from './components/MarketList';
import { FaGavel, FaChartBar, FaBolt, FaMedal, FaBook } from 'react-icons/fa';
import { useCreateMarket } from './hooks/useCreateMarket';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import ActivityFeed from './components/ActivityFeed';
import Leaderboard from './components/Leaderboard';
import Docs from './components/Docs';
import HeaderMarkets from './components/HeaderMarkets';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, } from 'wagmi';

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-orange-500 text-white px-4 py-2 rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };

function App() {
  // Remove all custom wallet state/logic
  const { address: userAddress, isConnected } = useAccount();
  const navigate = useNavigate();
 
  // Remove these lines that cause mobile crashes
  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  // const signer = provider.getSigner();
 
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const [showLanding, setShowLanding] = useState(location.pathname === '/');
  const [error, setError] = useState<string>('');
  const { createMarket } = useCreateMarket();

  // Initialize provider and signer only when needed
  const getProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    return null;
  };

  const getSigner = () => {
    const provider = getProvider();
    return provider ? provider.getSigner() : null;
  };

  
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
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${path === '/markets' ? 'bg-white shadow text-mint-700' : 'bg-gray-100 text-gray-400 hover:text-mint-600'}`}
            >
              <FaChartBar className="text-base sm:text-lg" /> <span className="hidden sm:inline">Markets</span>
            </Link>
            <Link
              to="/activities"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${path === '/activities' ? 'bg-white shadow text-mint-700' : 'bg-gray-100 text-gray-400 hover:text-mint-600'}`}
            >
              <FaBolt className="text-base sm:text-lg" /> <span className="hidden sm:inline">Activities</span>
            </Link>
            <Link
              to="/leaderboard"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-t-lg font-bold text-sm sm:text-base transition-all whitespace-nowrap cursor-pointer ${path === '/leaderboard' ? 'bg-white shadow text-mint-700' : 'bg-gray-100 text-gray-400 hover:text-mint-600'}`}
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
                signer={getSigner()}
              />
            </>
          } />
          <Route path="/activities" element={<ActivityFeed />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/docs/:docId" element={<Docs />} />
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
        <HeaderMarkets />
        <div className="flex gap-1 sm:gap-2 items-center">
          <ConnectButton showBalance={false} accountStatus="address" />
        </div>
      </header>
      {/* Add padding top to main content to avoid overlap with fixed header */}
      <div className="flex flex-col items-center min-h-screen w-full bg-gray-50 p-2 sm:p-4 pt-16 sm:pt-20 overflow-x-hidden">
        {showLanding && location.pathname === '/' ? (
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
            onBrowse={() => {
              setShowLanding(false);
              navigate('/markets');
            }}
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
          signer={getSigner()}
        />
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
      </div>
      {/* Fixed Read Docs button in lower right corner */}
      <button
        onClick={() => {
          navigate('/docs');
        }}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 cursor-pointer z-50 flex items-center gap-2 hover:scale-105"
      >
        <FaBook className="text-lg" />
        <span className="font-semibold">Read Docs</span>
      </button>
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
