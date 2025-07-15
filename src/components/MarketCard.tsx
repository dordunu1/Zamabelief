import React, { useState, useEffect } from 'react';
import { FaShareAlt, FaUsers, FaCoins, FaClock, FaComments, FaCheckCircle } from 'react-icons/fa';
import type { ConvictionMarket, ConvictionVote } from '../types/market';
import { useVote } from '../hooks/useVote';
import CommentModal from './CommentModal';
import { useBeliefMarketContract } from "../hooks/useBeliefMarketContract";
import { ethers } from "ethers";
// import { useIncentivWallet } from "incentiv-sdk"; // Uncomment and use actual SDK

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '...' : str;
}

function formatAddress(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

function getCountdown(expiresAt: number) {
  const now = Date.now();
  const diff = Math.max(0, expiresAt - now);
  const mins = Math.floor(diff / 60000) % 60;
  const hrs = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);
  return `${days}d ${hrs}h ${mins}m`;
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
  return text.split(urlRegex).map((part, i) => {
    if (!part) return null;
    if (part.match(urlRegex)) {
      const url = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline text-mint-600 hover:text-orange-500 font-medium">
          Link
        </a>
      );
    }
    return part;
  });
}

export interface MarketCardProps {
  market: ConvictionMarket;
  votes: ConvictionVote[];
  userAddress?: string;
  onVote?: (option: 'yes' | 'no', amount: number) => void;
  onClaim?: () => void;
}

interface MarketCardPropsWithWallet extends MarketCardProps {
  address: string;
  signer: any;
  connect: () => void;
  connecting: boolean;
}

const MarketCard: React.FC<MarketCardPropsWithWallet> = ({ market, votes, userAddress, address, signer, connect, connecting }) => {
  const [expanded, setExpanded] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | ''>('');
  const { vote } = useVote();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimState, setClaimState] = useState<'idle' | 'claiming' | 'claimed'>('idle');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const contract = useBeliefMarketContract(signer);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [votePending, setVotePending] = useState(false);
  const [claimAmount, setClaimAmount] = useState<number | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // On-chain vote state
  const [onChainYes, setOnChainYes] = useState<number>(0);
  const [onChainNo, setOnChainNo] = useState<number>(0);
  const [onChainYesPct, setOnChainYesPct] = useState<number>(0);
  const [onChainNoPct, setOnChainNoPct] = useState<number>(0);

  // On-chain claim eligibility
  const [canClaimOnChain, setCanClaimOnChain] = useState(false);

  // Firestore total stake
  const firestoreTotalStake = votes.reduce((sum, v) => sum + v.amount, 0);

  // Restore these for UI logic
  const isResolved = market.status === 'resolved';
  const isExpired = Date.now() > market.expiresAt;
  const userVote = votes.find(v => v.user === userAddress);

  useEffect(() => {
    const fetchOnChainVotes = async () => {
      if (!contract || !market.betId) return;
      try {
        const betInfo = await contract.getBetInfo(market.betId);
        const yes = Number(betInfo.totalYesVotes);
        const no = Number(betInfo.totalNoVotes);
        const total = yes + no;
        setOnChainYes(yes);
        setOnChainNo(no);
        setOnChainYesPct(total ? Math.round((yes / total) * 100) : 0);
        setOnChainNoPct(total ? 100 - Math.round((yes / total) * 100) : 0);
      } catch (err) {
        setOnChainYes(0);
        setOnChainNo(0);
        setOnChainYesPct(0);
        setOnChainNoPct(0);
      }
    };
    fetchOnChainVotes();
  }, [contract, market.betId]);

  // Fetch claimable amount when claim modal opens
  useEffect(() => {
    const fetchClaimAmount = async () => {
      if (!showClaimModal || !contract || !address) {
        setClaimAmount(null);
        return;
      }
      try {
        // Check pending withdrawals for the user
        const pendingAmount = await contract.pendingWithdrawals(address);
        setClaimAmount(Number(pendingAmount));
      } catch (err) {
        setClaimAmount(null);
      }
    };
    fetchClaimAmount();
  }, [showClaimModal, contract, address]);

  useEffect(() => {
    const checkClaimEligibility = async () => {
      if (!contract || !address) {
        setCanClaimOnChain(false);
        return;
      }
      try {
        // Check if user has any pending withdrawals
        const pendingAmount = await contract.pendingWithdrawals(address);
        setCanClaimOnChain(Number(pendingAmount) > 0);
      } catch (err) {
        setCanClaimOnChain(false);
      }
    };
    checkClaimEligibility();
  }, [contract, address, showClaimModal]);

  // Card content
  const cardContent = (
    <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-mint-100 hover:shadow-2xl transition-all p-0 overflow-hidden w-full max-w-2xl mx-auto">
      {/* Status badge */}
      <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold" style={{ background: market.status === 'active' ? '#2de3b6' : market.status === 'resolved' ? '#ff7a1a' : '#e5e7eb', color: market.status === 'active' || market.status === 'resolved' ? 'white' : '#6b7280', boxShadow: market.status === 'active' ? '0 2px 8px 0 #2de3b680' : undefined }}>
        {market.status.toUpperCase()}
      </div>
      {/* Card header */}
      <div className="px-6 pt-6 pb-2 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-mint-700 flex-1 truncate" title={market.title}>{market.title}</h3>
        </div>
        <div className="text-xs text-gray-400">By {formatAddress(market.creator)}</div>
      </div>
      {/* Description */}
      <div className="px-6 text-gray-700 text-sm mb-2">
        {expanded ? linkify(market.description) : truncate(market.description, 120)}
        {!expanded && market.description.length > 120 && (
          <span className="text-blue-500 ml-2 cursor-pointer" onClick={e => { e.stopPropagation(); setExpanded(true); }}>Read more</span>
        )}
      </div>
      {/* User's vote display */}
      {userVote && (
        <div className="px-6 mb-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200`}>
            <span>You voted:</span>
            <span className={`px-2 py-0.5 rounded text-xs bg-orange-500 text-white`}>
              {userVote.option === 'yes' ? 'YES' : userVote.option === 'no' ? 'NO' : 'N/A'}
            </span>
            <span className="text-xs opacity-75">({userVote.amount} TCENT)</span>
          </div>
        </div>
      )}
      {/* Info grid */}
      <div className="px-6 grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs mb-2">
        <div className="flex items-center gap-2 bg-mint-50 rounded-lg px-2 py-1">
          <FaClock className="text-mint-500 text-lg" />
          <span className="whitespace-nowrap">{getCountdown(market.expiresAt)}</span>
        </div>
        <div className="flex items-center justify-center bg-orange-50 rounded-lg px-2 py-1">
          <FaUsers className="text-orange-500 text-xl" />
          <span className="ml-1 font-bold">{new Set(votes.map(v => v.user)).size}</span>
        </div>
        <div className="flex items-center justify-end gap-2 bg-mint-50 rounded-lg px-2 py-1">
          <FaCoins className="text-mint-500" />
          {firestoreTotalStake} TCENT
          <FaCheckCircle className="text-orange-500 text-2xl ml-2" />
        </div>
      </div>
      {/* Progress bar - hide real values unless resolved */}
      <div className="px-6 my-4">
        <div className="relative w-full h-10 rounded-lg bg-gray-200 flex overflow-hidden">
          {(!isResolved) ? (
            <>
              <div
                className="h-full flex items-center justify-start pl-4 font-bold text-base transition-all select-none"
                style={{ width: '50%', backgroundColor: '#2de3b6', color: 'white' }}
              >
                Yes: 0 (0%)
              </div>
              <div
                className="h-full flex items-center justify-end pr-4 font-bold text-base transition-all select-none"
                style={{ width: '50%', backgroundColor: '#ff7a1a', color: 'white' }}
              >
                No: 0 (0%)
              </div>
            </>
          ) : (
            <>
              {onChainYesPct > 0 && (
                <div
                  className="h-full flex items-center justify-start pl-4 font-bold text-base transition-all select-none"
                  style={{ width: `${onChainYesPct}%`, backgroundColor: '#2de3b6', color: 'white' }}
                >
                  Yes: {onChainYes} ({onChainYesPct}%)
                </div>
              )}
              {onChainNoPct > 0 && (
                <div
                  className="h-full flex items-center justify-end pr-4 font-bold text-base transition-all select-none"
                  style={{ width: `${onChainNoPct}%`, backgroundColor: '#ff7a1a', color: 'white' }}
                >
                  No: {onChainNo} ({onChainNoPct}%)
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Action row below progress bar */}
      <div className="px-6 pb-4 flex flex-row gap-2 items-center">
        {/* Voting button logic fix */}
        {market.status === 'active' && address && !userVote ? (
          <button
            className="flex-1 font-bold px-4 py-2 rounded-lg shadow-lg transition cursor-pointer"
            style={{ background: '#2de3b6', color: 'white', boxShadow: '0 2px 12px 0 #2de3b680' }}
            onMouseOver={e => (e.currentTarget.style.background = '#1fc9a2')}
            onMouseOut={e => (e.currentTarget.style.background = '#2de3b6')}
            onClick={e => { e.stopPropagation(); setVoteModalOpen(true); }}
          >
            Place Prediction
          </button>
        ) : market.status === 'active' && address && userVote ? (
          <button
            className="flex-1 font-bold px-4 py-2 rounded-lg shadow-lg transition bg-gray-200 text-gray-400 cursor-not-allowed"
            disabled
          >
            You have already voted
          </button>
        ) : null}
        {isExpired && !isResolved ? (
          <button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition cursor-pointer disabled:opacity-60"
            disabled={!contract || votePending}
            onClick={async (e) => {
              e.stopPropagation();
              setVotePending(true);
              try {
                await contract.resolveBet(market.betId);
                // Update Firestore market status to 'resolved'
                if (market.id) {
                  const { db } = await import('../firebase');
                  const { doc, updateDoc } = await import('firebase/firestore');
                  await updateDoc(doc(db, 'markets', market.id), { status: 'resolved' });
                }
              } catch (err) {
                // Optionally, show error
                console.error(err);
              }
              setVotePending(false);
            }}
          >
            {votePending ? 'Resolving...' : 'Resolve'}
          </button>
        ) : isResolved && canClaimOnChain && (
          // Show claim if user has pending withdrawals
          <button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition cursor-pointer"
            onClick={e => { e.stopPropagation(); setShowClaimModal(true); }}
          >
            Claim
          </button>
        )}
        {/* Show closed button for resolved bets if user cannot claim */}
        {isResolved && !canClaimOnChain && (
          <button
            className="flex-1 font-bold px-4 py-2 rounded-lg shadow-lg transition bg-gray-300 text-gray-500 cursor-not-allowed"
            disabled
          >
            Closed
          </button>
        )}
        {/* Share and Comments buttons */}
        <button
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
          title="Share to X"
          onClick={e => {
            e.stopPropagation();
            const shareText = `🚀 Check out this conviction market!\n"${market.title}"\n${market.description}\nThink you know better? Place your bet now!`;
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        >
          <FaShareAlt className="text-mint-500" />
        </button>
        <button
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
          title="Comments"
          onClick={e => { e.stopPropagation(); setCommentModalOpen(true); }}
        >
          <FaComments className="text-orange-500" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="my-6 cursor-pointer" onClick={() => setExpanded(true)}>
        {cardContent}
      </div>
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setExpanded(false)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            {cardContent}
          </div>
        </div>
      )}
      {/* Voting Modal */}
      {voteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setVoteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setVoteModalOpen(false)}>&times;</button>
            <h2 className="text-xl font-bold text-mint-700 mb-6 text-center">Place Your Prediction</h2>
            <div className="flex flex-col gap-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="prediction"
                  value="yes"
                  checked={selectedOption === 'yes'}
                  onChange={() => setSelectedOption('yes')}
                  className="accent-mint-500 w-5 h-5 rounded-full border-2 border-mint-500 focus:ring-mint-500"
                  disabled={!!userVote}
                />
                <span className="font-bold text-mint-600">Yes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="prediction"
                  value="no"
                  checked={selectedOption === 'no'}
                  onChange={() => setSelectedOption('no')}
                  className="accent-orange-500 w-5 h-5 rounded-full border-2 border-orange-500 focus:ring-orange-500"
                  disabled={!!userVote}
                />
                <span className="font-bold text-orange-600">No</span>
              </label>
            </div>
            {!address ? (
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg transition cursor-pointer text-lg disabled:opacity-60 mb-2"
                onClick={connect}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect Incentiv Wallet'}
              </button>
            ) : (
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg transition cursor-pointer text-lg disabled:opacity-60 mb-2"
                style={{ boxShadow: '0 2px 12px 0 #2de3b680', marginBottom: 0 }}
                disabled={!selectedOption || !!userVote || votePending}
                onClick={async () => {
                  setVotePending(true);
                  if (!market.betId) {
                    setVotePending(false);
                    return;
                  }
                  console.log('Voting with betId:', market.betId, 'amount:', market.minBet);
                  if (selectedOption && userAddress && !userVote) {
                    try {
                      await contract.castVote(
                        market.betId,
                        selectedOption === "yes",
                        { value: market.minBet }
                      );
                      await vote({
                        marketId: market.id,
                        user: userAddress,
                        option: selectedOption,
                        amount: market.minBet
                      });
                      setVoteSuccess(true);
                      setVoteModalOpen(false);
                      setSelectedOption("");
                    } catch (err: any) {
                      console.error(err.message || "Failed to vote");
                    }
                    setVotePending(false);
                  }
                }}
              >
                {votePending ? 'Voting...' : userVote ? 'You have already voted' : 'Vote'}
              </button>
            )}
            <div className="mt-4 text-xs text-gray-500 text-center">Voting amount: <span className="font-bold text-mint-700">{market.minBet} TCENT</span> (set by market creator)</div>
          </div>
        </div>
      )}
      {voteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <h2 className="text-xl font-bold mb-2 text-center">Transaction Sent!</h2>
            <div className="text-gray-600 text-center mb-6">Your vote has been sent successfully. Please wait for the data to be updated on the next confirmed block!</div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow text-lg"
              onClick={() => setVoteSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowClaimModal(false); setClaimState('idle'); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => { setShowClaimModal(false); setClaimState('idle'); }}>&times;</button>
            <h2 className="text-xl font-bold text-mint-700 mb-6 text-center">Withdraw Rewards</h2>
            <div className="text-center text-lg font-semibold mb-6">
              {claimAmount === null ? (
                <span>Loading...</span>
              ) : claimAmount !== undefined ? (
                claimAmount > 0 ? (
                  <>You can withdraw: <span className="text-orange-500">{claimAmount} TCENT</span></>
                ) : (
                  <span>No rewards available to withdraw.</span>
                )
              ) : (
                <span>Unable to fetch withdrawable amount.</span>
              )}
            </div>
            {!address ? (
              <button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg transition cursor-pointer text-lg"
                onClick={connect}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect Incentiv Wallet'}
              </button>
            ) : (
              <div className="flex gap-4 justify-center mt-4">
                <button
                  className={`bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow text-lg transition ${claimAmount === 0 || claimState === 'claiming' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={claimAmount === 0 || claimState === 'claiming'}
                  onClick={async () => {
                    setClaimState('claiming');
                    setClaimError(null);
                    try {
                      // Detect if signer is IncentivSigner (AA wallet)
                      // TODO: Use RainbowKit's signer/account instead
                      if (signer) {
                        // Encode withdraw call
                        const iface = new ethers.utils.Interface([
                          "function withdraw()"
                        ]);
                        const data = iface.encodeFunctionData("withdraw", []);
                        // Send transaction via IncentivSigner (AA wallet)
                        await signer.sendTransaction({
                          to: contract.address,
                          data,
                          gasLimit: ethers.utils.hexlify(1000000),
                          gasPrice: ethers.utils.parseUnits('10', 'gwei')
                        });
                      } else {
                        // EOA: call contract directly
                        await contract.withdraw({
                          gasLimit: ethers.utils.hexlify(1000000),
                          gasPrice: ethers.utils.parseUnits('10', 'gwei')
                        });
                      }
                      setClaimState('claimed');
                      setClaimSuccess(true);
                    } catch (err: any) {
                      console.error(err);
                      setClaimError(err.message || "Failed to withdraw");
                      setClaimState('idle');
                    }
                  }}
                >
                  {claimState === 'claiming' ? 'Withdrawing...' : 'Withdraw'}
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg shadow text-lg transition"
                  onClick={() => { setShowClaimModal(false); setClaimState('idle'); }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Claim Success Modal */}
      {claimSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
            <div className="text-green-500 text-4xl mb-2">✓</div>
            <h2 className="text-xl font-bold mb-2 text-center">Withdrawal Successful!</h2>
            <div className="text-gray-600 text-center mb-6">Your rewards have been withdrawn. They will appear in your wallet soon.</div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow text-lg"
              onClick={() => { setClaimSuccess(false); setShowClaimModal(false); setClaimState('idle'); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Claim Error Modal */}
      {claimError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
            <div className="text-red-500 text-4xl mb-2">!</div>
            <h2 className="text-xl font-bold mb-2 text-center">Withdrawal Failed</h2>
            <div className="text-gray-600 text-center mb-6">{claimError}</div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow text-lg"
              onClick={() => setClaimError(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {commentModalOpen && (
        <CommentModal
          marketId={market.id}
          userAddress={userAddress || ''}
          isOpen={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
        />
      )}
    </>
  );
};

export default MarketCard; 