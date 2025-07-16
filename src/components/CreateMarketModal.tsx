import React, { useState } from 'react';
import { ethers } from "ethers";
import BeliefMarketABI from '../abi/BeliefMarketFHE.json';
// import { useBeliefMarketContract } from "../hooks/useBeliefMarketContract";
// import { useIncentivWallet } from "incentiv-sdk"; // Uncomment and use actual SDK

const MIN_TITLE = 5;
const MAX_TITLE = 100;
const MIN_DESC = 150;
const MAX_DESC = 1000;
const EXPIRY_OPTIONS = [
  { label: '10 minutes', value: 10 * 60, range: 'Short', description: 'Quick bets, fast results' },
  { label: '30 minutes', value: 30 * 60, range: 'Short', description: 'Quick bets, fast results' },
  { label: '1 hour', value: 60 * 60, range: 'Short', description: 'Good for rapid predictions' },
  { label: '4 hours', value: 4 * 60 * 60, range: 'Short', description: 'Short-term, more time to join' },
  { label: '12 hours', value: 12 * 60 * 60, range: 'Medium', description: 'Half-day, more participants' },
  { label: '24 hours', value: 24 * 60 * 60, range: 'Medium', description: 'One day, more reach' },
  { label: '48 hours', value: 48 * 60 * 60, range: 'Medium', description: 'Two days, more reach' },
  { label: '72 hours', value: 72 * 60 * 60, range: 'Medium', description: 'Three days, more reach' },
  { label: '7 days', value: 7 * 24 * 60 * 60, range: 'Long', description: 'One week, maximum exposure' },
  { label: '14 days', value: 14 * 24 * 60 * 60, range: 'Long', description: 'Two weeks, maximum exposure' },
  { label: '30 days', value: 30 * 24 * 60 * 60, range: 'Long', description: 'One month, maximum exposure' },
];
const CONTRACT_CREATION_FEE = ethers.utils.parseEther('0.02'); // 0.02 ETH in wei
const CONTRACT_ADDRESS = import.meta.env.VITE_BELIEF_MARKET_ADDRESS;

const countNonSpace = (str: string) => str.replace(/\s/g, '').length;

function getFriendlyErrorMessage(error: any) {
  if (!error) return "Something went wrong. Please try again.";
  if (error.code === 4001 || error.code === "ACTION_REJECTED") {
    return "Transaction was cancelled. No changes were made.";
  }
  if (typeof error.message === "string" && error.message.toLowerCase().includes("user denied")) {
    return "Transaction was cancelled. No changes were made.";
  }
  if (error.error && typeof error.error.message === "string" && error.error.message.toLowerCase().includes("user denied")) {
    return "Transaction was cancelled. No changes were made.";
  }
  if (typeof error.message === "string") {
    return error.message.split('\n')[0].slice(0, 200);
  }
  return "Something went wrong. Please try again.";
}

// Update props interface
interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  address?: string;
  signer?: any;
  connect?: () => void;
  connecting?: boolean;
  walletError?: string;
}

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose, onSubmit, address, connect = () => {}, connecting = false, walletError }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState(EXPIRY_OPTIONS[0].value);
  const [minBet, setMinBet] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Instantiate contract directly with signer
  // const contract = signer && CONTRACT_ADDRESS
  //   ? new ethers.Contract(CONTRACT_ADDRESS, BeliefMarketABI.abi, signer)
  //   : null;

  const MIN_BET = 0.001;

  const validate = () => {
    if (title.length < MIN_TITLE || title.length > MAX_TITLE) {
      return `Title must be ${MIN_TITLE}-${MAX_TITLE} characters.`;
    }
    const descLen = countNonSpace(description);
    if (descLen < MIN_DESC || descLen > MAX_DESC) {
      return `Description must be ${MIN_DESC}-${MAX_DESC} non-space characters.`;
    }
    if (minBet < MIN_BET) {
      return `Minimum bet must be at least ${MIN_BET} ETH.`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    // Always use MetaMask signer for contract writes
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = CONTRACT_ADDRESS
      ? new ethers.Contract(CONTRACT_ADDRESS, BeliefMarketABI.abi, signer)
      : null;
    if (!contract) {
      setError("Contract not available");
      return;
    }
    setSubmitting(true);
    try {
      // Generate a unique betId using address and timestamp
      const betId = `${address}-${Date.now()}`;
      const minBetWei = ethers.utils.parseEther(minBet.toString());
      await contract.createBet(
        betId,
        minBetWei,
        expiry,
        {
          value: CONTRACT_CREATION_FEE,
          gasLimit: 5000000,
          gasPrice: ethers.utils.parseUnits('5', 'gwei'),
        }
      );
      // Immediately add to Firestore
      onSubmit({ title, description, expiry, minBet, options: ['Yes, it will', "No, it won't"], betId });
      setShowSuccess(true);
      setTitle('');
      setDescription('');
      setExpiry(EXPIRY_OPTIONS[0].value);
      setMinBet(50);
      setError('');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    }
    setSubmitting(false);
  };

  const isFormValid = !validate();

  if (!isOpen) return null;

  if (!address) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-2xl border-2 border-mint-200 relative flex flex-col items-center">
          <h2 className="text-2xl font-bold text-mint-700 mb-4">Connect Your Wallet</h2>
          <button
            onClick={connect}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-lg mb-4"
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Incentiv Wallet'}
          </button>
          {walletError && <div className="text-red-500 mb-2">{walletError}</div>}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold absolute top-4 right-4"
          >×</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-2xl border-2 border-mint-200 relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-mint-700 mb-4">Create Conviction Market</h2>
        <div className="mb-2 p-3 bg-orange-50 border-l-4 border-orange-400 text-orange-700 rounded">
          <strong>Note:</strong> As the market creator, you are responsible for resolving the market after the voting period ends. Once the market expires, you must click the <b>Resolve</b> button to finalize the outcome and allow winners to claim their rewards.
        </div>
        <div className="mb-4">
          <label className="block text-mint-700 font-semibold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            minLength={MIN_TITLE}
            maxLength={MAX_TITLE}
            required
            className="w-full border border-mint-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint-400"
            placeholder="Short, descriptive title"
          />
        </div>
        <div className="mb-4">
          <label className="block text-mint-700 font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            minLength={MIN_DESC}
            maxLength={MAX_DESC}
            required
            className="w-full border border-orange-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-[100px]"
            placeholder="Detailed description (min 150 non-space chars)"
          />
          <div className="text-xs text-gray-500 mt-1">
            {countNonSpace(description)} / {MIN_DESC} non-space characters
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-mint-700 font-semibold mb-1">Expires In</label>
          <div className="mb-2 text-xs text-gray-500">
            <span className="inline-block bg-mint-100 text-mint-700 rounded px-2 py-0.5 mr-2">Short</span>
            10m, 30m, 1h, 4h &mdash; Fast results, less exposure<br/>
            <span className="inline-block bg-orange-100 text-orange-700 rounded px-2 py-0.5 mr-2 mt-1">Medium</span>
            12h, 24h, 48h, 72h &mdash; More time for participants<br/>
            <span className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-0.5 mr-2 mt-1">Long</span>
            7d, 14d, 30d &mdash; Maximum reach, slow results
          </div>
          <select
            value={expiry}
            onChange={e => setExpiry(Number(e.target.value))}
            className="w-full border border-mint-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint-400"
          >
            {['Short', 'Medium', 'Long'].map(range => (
              <optgroup key={range} label={range + ' Range'}>
                {EXPIRY_OPTIONS.filter(opt => opt.range === range).map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} &mdash; {opt.description}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <label className="block text-mint-700 font-semibold mb-1">Minimum Bet Amount</label>
            <input
              type="number"
              value={minBet}
              min={MIN_BET}
              step={MIN_BET}
              onChange={e => setMinBet(Number(e.target.value))}
              className="w-full border border-mint-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint-400"
              placeholder={`Minimum bet (${MIN_BET} ETH)`}
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-mint-700 font-semibold mb-1">Market Creation Fee</label>
            <div className="w-full border border-orange-200 rounded-md px-3 py-2 bg-orange-50 text-orange-700">
              0.02 ETH (paid to protocol)
            </div>
          </div>
        </div>
        {error && (
          <div className="text-red-600 text-sm text-center mt-2">{error}</div>
        )}
        <button
          type="submit"
          disabled={submitting || !isFormValid}
          className={`min-w-[160px] mx-auto block font-bold py-3 px-6 rounded-lg shadow transition-all text-lg 
            ${isFormValid && !submitting
              ? 'bg-orange-500 hover:bg-orange-600 text-white cursor-pointer'
              : 'bg-orange-200 text-white opacity-70 cursor-not-allowed'}
          `}
        >
          {submitting ? 'Creating...' : 'Create Market'}
        </button>
      </form>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <h2 className="text-xl font-bold mb-2 text-center">Transaction Sent!</h2>
            <div className="text-gray-600 text-center mb-6">Your transaction has been sent successfully. Please wait for the data to be updated on the next confirmed block!</div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow text-lg"
              onClick={() => { setShowSuccess(false); onClose(); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMarketModal; 