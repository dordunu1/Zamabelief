import React, { useState, useEffect } from 'react';
import { FaShareAlt, FaUsers, FaCoins, FaClock, FaComments, FaCheckCircle } from 'react-icons/fa';
import type { ConvictionMarket, ConvictionVote } from '../types/market';
import CommentModal from './CommentModal';
import { useBeliefMarketContract } from "../hooks/useBeliefMarketContract";
import { ethers, BigNumber } from "ethers";
import { useCastVote } from '../hooks/useCastVote';
import BeliefMarketABI from '../abi/BeliefMarketFHE.json';
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

function formatEthFromWei(weiValue: number | string): string {
  const ethValue = ethers.utils.formatEther(weiValue.toString());
  return parseFloat(ethValue).toFixed(4); // Show 4 decimal places
}

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
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const contract = useBeliefMarketContract(signer);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [votePending, setVotePending] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const { castConfidentialVote } = useCastVote();
  const [error, setError] = useState<string | null>(null);

  // On-chain vote state

  // On-chain resolved tallies
  const [resolvedYes, setResolvedYes] = useState<number | null>(null);
  const [resolvedNo, setResolvedNo] = useState<number | null>(null);

  // Firestore total stake
  const firestoreTotalStake = votes.reduce((sum, v) => sum + v.amount, 0);

  // Restore these for UI logic
  const isResolved = market.status === 'resolved';
  const isExpired = Date.now() > market.expiresAt;
  const userVote = votes.find(v => v.user === userAddress);

  // Fetch betInfo from contract if not already present
  const [betInfo, setBetInfo] = useState<any>(null);
  useEffect(() => {
    async function fetchBetInfo() {
      if (!contract || !market.betId) return;
      try {
        const info = await contract.getBet(market.betId);
        setBetInfo(info);
      } catch (err) {
        setBetInfo(null);
      }
    }
    fetchBetInfo();
  }, [contract, market.betId]);

  useEffect(() => {
    const fetchOnChainVotes = async () => {
      if (!contract || !market.betId) return;
      try {
        const betInfo = await contract.getBetInfo(market.betId);
        const yes = Number(betInfo.totalYesVotes);
        const no = Number(betInfo.totalNoVotes);
        setResolvedYes(yes);
        setResolvedNo(no);
      } catch (err) {
      }
    };
    fetchOnChainVotes();
  }, [contract, market.betId]);

  useEffect(() => {
    const fetchResolvedTallies = async () => {
      if (!contract || !market.betId || market.status !== 'resolved') {
        setResolvedYes(null);
        setResolvedNo(null);
        return;
      }
      try {
        const betInfo = await contract.getBet(market.betId);
        setResolvedYes(Number(betInfo.yesVotes));
        setResolvedNo(Number(betInfo.noVotes));
      } catch (err) {
        setResolvedYes(null);
        setResolvedNo(null);
      }
    };
    fetchResolvedTallies();
  }, [contract, market.betId, market.status]);

  // Restore yesWon state and fetching logic (but keep pendingWithdrawals/claimAmount removed)
  const [yesWon, setYesWon] = useState<boolean | null>(null);
  useEffect(() => {
    const fetchYesWon = async () => {
      if (!contract || !market.betId) {
        setYesWon(null);
        return;
      }
      try {
        if (isResolved) {
          const betInfo = await contract.getBet(market.betId);
          setYesWon(Boolean(betInfo.yesWon));
        } else {
          setYesWon(null);
        }
      } catch (err) {
        setYesWon(null);
      }
    };
    fetchYesWon();
  }, [contract, market.betId, isResolved]);

  // Remove claimable amount fetch using pendingWithdrawals
  // useEffect(() => {
  //   if (showClaimModal && contract && address) {
  //     contract.pendingWithdrawals(address).then((amount: any) => {
  //       setClaimAmount(ethers.utils.formatEther(amount.toString()));
  //     });
  //   }
  // }, [showClaimModal, contract, address]);

  // Remove canClaimOnChain and claimAmount state and logic

  const [claiming, setClaiming] = useState(false);
  const isTie = isResolved && resolvedYes !== null && resolvedNo !== null && resolvedYes === resolvedNo;
  const handleClaim = async () => {
    setClaiming(true);
    try {
      await contract.claimPrize(market.betId);
      // Refresh hasClaimed status
      if (contract && market.betId && address) {
        const claimed = await contract.hasUserClaimed(market.betId, address);
        setHasClaimed(claimed);
      }
      setShowClaimModal(false);
      // Optionally show a success message
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    }
    setClaiming(false);
  };
  const handleRefund = async () => {
    setClaiming(true);
    try {
      await contract.claimRefund(market.betId);
      // Refresh hasClaimed status
      if (contract && market.betId && address) {
        const claimed = await contract.hasUserClaimed(market.betId, address);
        setHasClaimed(claimed);
      }
      setShowClaimModal(false);
      // Optionally show a success message
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    }
    setClaiming(false);
  };

  // Restore and use hasClaimed state
  const [hasClaimed, setHasClaimed] = useState(false);
  useEffect(() => {
    async function fetchHasClaimed() {
      if (!contract || !market.betId || !address) return;
      try {
        const claimed = await contract.hasUserClaimed(market.betId, address);
        setHasClaimed(claimed);
      } catch (err) {
        setHasClaimed(false);
      }
    }
    fetchHasClaimed();
  }, [contract, market.betId, address, showClaimModal]);

  // Make sure betInfo is defined before calculating eligibleAmount
  let eligibleAmount = "0.0";
  if (betInfo) {
    if (
      isResolved &&
      !isTie &&
      userVote &&
      ((yesWon === true && userVote.option === 'yes') || (yesWon === false && userVote.option === 'no'))
    ) {
      // Winner - use new contract logic
      const userWeight = BigNumber.from(betInfo.voteStake ? betInfo.voteStake : 0);
      const totalWinningWeight = yesWon ? BigNumber.from(betInfo.yesVotes) : BigNumber.from(betInfo.noVotes);
      const prizePool = BigNumber.from(betInfo.prizePool ? betInfo.prizePool : 0);
      eligibleAmount = (totalWinningWeight.gt(0))
        ? ethers.utils.formatEther(prizePool.mul(userWeight).div(totalWinningWeight))
        : "0.0";
    } else if (isResolved && isTie && userVote) {
      // Tie refund
      const voteStake = BigNumber.from(betInfo.voteStake ? betInfo.voteStake : 0);
      eligibleAmount = ethers.utils.formatEther(voteStake);
    }
  }

  // Remove debug log for claim button visibility

  // Card content
  const cardContent = (
    <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-mint-100 hover:shadow-2xl transition-all p-0 overflow-hidden w-full max-w-2xl mx-auto">
      {/* Status badge */}
      <div
        className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold"
        style={{
          background:
            isResolved
              ? '#ff7a1a'
              : isExpired
              ? '#e5e7eb'
              : '#2de3b6',
          color:
            isResolved || !isExpired
              ? 'white'
              : '#6b7280',
          boxShadow: !isExpired && !isResolved ? '0 2px 8px 0 #2de3b680' : undefined,
        }}
      >
        {isResolved
          ? 'RESOLVED'
          : isExpired
          ? 'RESOLVING'
          : 'ACTIVE'}
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
            <span className="text-xs opacity-75">({formatEthFromWei(userVote.amount)} ETH)</span>
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
          {formatEthFromWei(firestoreTotalStake)} ETH
          <FaCheckCircle className="text-orange-500 text-2xl ml-2" />
        </div>
      </div>
      {/* Progress bar - always show both Yes and No after resolved */}
      <div className="px-6 my-4">
        <div className="relative w-full h-10 rounded-lg bg-gray-200 flex overflow-hidden">
          {isResolved && resolvedYes !== null && resolvedNo !== null ? (() => {
            const total = resolvedYes + resolvedNo;
            const yesPct = total ? Math.round((resolvedYes / total) * 100) : 0;
            const noPct = total ? 100 - yesPct : 0;
            return (
              <>
                <div
                  className="h-full flex items-center justify-start pl-4 font-bold text-base transition-all select-none"
                  style={{ width: `${yesPct}%`, backgroundColor: '#2de3b6', color: 'white' }}
                >
                  Yes: {resolvedYes / 1e18} ({yesPct}%)
                </div>
                <div
                  className="h-full flex items-center justify-end pr-4 font-bold text-base transition-all select-none"
                  style={{ width: `${noPct}%`, backgroundColor: '#ff7a1a', color: 'white' }}
                >
                  No: {resolvedNo / 1e18} ({noPct}%)
                </div>
              </>
            );
          })() : (
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
             voted
          </button>
        ) : null}
        {isExpired && !isResolved && address === market.creator ? (
          <button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition cursor-pointer disabled:opacity-60"
            disabled={!contract || votePending}
            onClick={async (e) => {
              e.stopPropagation();
              setVotePending(true);
              try {
                // Use ABI from BeliefMarketFHE.json
                const contractWithABI = new ethers.Contract(contract.address, BeliefMarketABI.abi, signer);
                await contractWithABI.requestTallyReveal(market.betId);
                // Immediately update Firestore market status to 'resolved'
                if (market.id) {
                  const { db } = await import('../firebase');
                  const { doc, updateDoc } = await import('firebase/firestore');
                  await updateDoc(doc(db, 'markets', market.id), { status: 'resolved' });
                }
              } catch (err: any) {
                setError(getFriendlyErrorMessage(err));
              }
              setVotePending(false);
            }}
          >
            {votePending ? 'Resolving...' : 'Resolve'}
          </button>
        ) : isExpired && !isResolved ? (
          <button
            className="flex-1 font-bold px-4 py-2 rounded-lg shadow-lg transition bg-gray-200 text-gray-400 cursor-not-allowed"
            disabled
          >
            Resolving
          </button>
        ) : null}
        {isResolved && !isTie && userVote && ((yesWon === true && userVote.option === 'yes') || (yesWon === false && userVote.option === 'no')) && (
          <button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition cursor-pointer"
            onClick={e => { e.stopPropagation(); setShowClaimModal(true); }}
            disabled={claiming || hasClaimed}
          >
            {hasClaimed ? 'Claimed' : claiming ? 'Claiming...' : 'Claim'}
          </button>
        )}
        {isResolved && isTie && userVote && (
          <button
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition cursor-pointer"
            onClick={e => { e.stopPropagation(); setShowClaimModal(true); }}
            disabled={claiming || hasClaimed}
          >
            {hasClaimed ? 'Claimed' : claiming ? 'Claiming...' : 'Claim Refund'}
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
      {error && (
        <div className="text-red-600 text-sm text-center mt-2">{error}</div>
      )}
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
                  if (selectedOption && userAddress && !userVote) {
                    try {
                      await castConfidentialVote({
                        contractAddress: contract.address,
                        abi: BeliefMarketABI.abi,
                        betId: market.betId,
                        marketId: market.id, // Pass the Firestore document ID
                        voteType: selectedOption === 'yes' ? 1 : 0,
                        voteStake: ethers.utils.parseEther(market.minBet.toString()).toString(),
                        signer,
                        setVoteStep: undefined, // or your UI step handler
                        onCastVote: () => {
                          setVoteSuccess(true);
                          setVoteModalOpen(false);
                          setSelectedOption("");
                        }
                      });
                    } catch (err: any) {
                      setError(getFriendlyErrorMessage(err));
                    }
                    setVotePending(false);
                  }
                }}
              >
                {votePending ? 'Voting...' : userVote ? ' voted' : 'Vote'}
              </button>
            )}
            <div className="mt-4 text-xs text-gray-500 text-center">
              Voting amount: <span className="font-bold text-mint-700">{market.minBet} ETH</span> (set by market creator)
            </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowClaimModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowClaimModal(false)}>&times;</button>
            <h2 className="text-xl font-bold text-mint-700 mb-6 text-center">Claim Rewards</h2>
            <div className="text-center text-lg font-semibold mb-6">
              You can claim: {eligibleAmount} ETH
            </div>
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg transition cursor-pointer text-lg disabled:opacity-60 mb-2"
              disabled={claiming}
              onClick={async () => {
                if (isTie) {
                  await handleRefund();
                } else {
                  await handleClaim();
                }
              }}
            >
              {claiming ? 'Claiming...' : 'Confirm Claim'}
            </button>
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
              onClick={() => { setClaimSuccess(false); setShowClaimModal(false); }}
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