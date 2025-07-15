// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract BeliefMarketFHE is SepoliaConfig {
    struct BetInfo {
        address creator;
        uint256 platformStake;
        uint256 voteStake;
        uint256 expiryTime;
        bool isResolved;
        euint64 yesVotes;
        euint64 noVotes;
        uint64 revealedYes;
        uint64 revealedNo;
        uint256 prizePool;
        bool yesWon;
        uint256 decryptionRequestId;
    }

    uint256 public platformStake = 0.02 ether;
    uint256 public constant MIN_VOTE_STAKE = 0.005 ether;
    uint256 public constant MIN_DURATION = 5 minutes;
    uint256 public constant MAX_DURATION = 30 days;

    mapping(string => BetInfo) private bets;
    mapping(string => mapping(address => bool)) public hasVoted;
    mapping(string => bool) public callbackHasBeenCalled;
    mapping(uint256 => string) internal betIdByRequestId;
    mapping(address => uint256) public pendingWithdrawals;
    uint256 public platformFees;
    address public owner;

    event BetCreated(string betId, address creator, uint256 stakeAmount, uint256 voteStake, uint256 expiryTime);
    event VoteCast(string betId, address voter, uint8 voteType, uint256 amount);
    event BetResolved(string betId, bool yesWon, uint64 revealedYes, uint64 revealedNo, uint256 totalPrize);
    event PrizeDistributed(string betId, address winner, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event WithdrawalPending(address indexed user, uint256 amount);
    event TallyRevealRequested(string betId, uint256 requestId);
    event DebugCallbackStep(string step, string betId);
    event CallbackFlagSet(string betId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPlatformStake(uint256 newStake) external onlyOwner {
        require(newStake > 0, "Platform stake must be positive");
        platformStake = newStake;
    }

    function withdrawPlatformFees(address to) external onlyOwner {
        require(platformFees > 0, "No fees to withdraw");
        uint256 amount = platformFees;
        platformFees = 0;
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit PlatformFeesWithdrawn(to, amount);
    }

    function createBet(
        string memory betId,
        uint256 voteStake,
        uint256 duration
    ) external payable {
        require(msg.value == platformStake, "Must stake the current platform fee");
        platformFees += msg.value;
        require(voteStake >= MIN_VOTE_STAKE, "Vote stake too low");
        require(duration >= MIN_DURATION && duration <= MAX_DURATION, "Invalid duration");
        require(bets[betId].creator == address(0), "Bet already exists");
        bets[betId] = BetInfo({
            creator: msg.sender,
            platformStake: msg.value,
            voteStake: voteStake,
            expiryTime: block.timestamp + duration,
            isResolved: false,
            yesVotes: FHE.asEuint64(0),
            noVotes: FHE.asEuint64(0),
            revealedYes: 0,
            revealedNo: 0,
            prizePool: 0,
            yesWon: false,
            decryptionRequestId: 0
        });
        emit BetCreated(betId, msg.sender, msg.value, voteStake, block.timestamp + duration);
    }

    // VoteType: 0 = No, 1 = Yes
    function vote(
        string memory betId,
        externalEuint64 encryptedWeight,
        uint8 voteType,
        bytes calldata inputProof
    ) external payable {
        BetInfo storage bet = bets[betId];
        require(bet.creator != address(0), "Bet doesn't exist");
        require(!bet.isResolved, "Bet already resolved");
        require(block.timestamp < bet.expiryTime, "Bet expired");
        require(msg.value == bet.voteStake, "Incorrect vote stake");
        require(!hasVoted[betId][msg.sender], "Already voted");

        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);
        euint64 zero = FHE.asEuint64(0);
        ebool isYes = FHE.eq(FHE.asEuint64(voteType), FHE.asEuint64(1));
        ebool isNo = FHE.eq(FHE.asEuint64(voteType), FHE.asEuint64(0));

        bet.yesVotes = FHE.add(bet.yesVotes, FHE.select(isYes, weight, zero));
        bet.noVotes = FHE.add(bet.noVotes, FHE.select(isNo, weight, zero));

        FHE.allowThis(bet.yesVotes);
        FHE.allowThis(bet.noVotes);

        hasVoted[betId][msg.sender] = true;
        bet.prizePool += msg.value;
        emit VoteCast(betId, msg.sender, voteType, msg.value);
    }

    // Request decryption of tallies after expiry
    function requestTallyReveal(string memory betId) external {
        BetInfo storage bet = bets[betId];
        require(bet.creator != address(0), "Bet doesn't exist");
        require(block.timestamp >= bet.expiryTime, "Bet not expired");
        require(!bet.isResolved, "Already resolved");
        require(msg.sender == bet.creator, "Only creator can request reveal");

        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(bet.yesVotes);
        cts[1] = FHE.toBytes32(bet.noVotes);

        uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);
        bet.decryptionRequestId = requestId;
        betIdByRequestId[requestId] = betId;
        emit TallyRevealRequested(betId, requestId);
    }

    // Callback for decryption oracle
    function resolveTallyCallback(
        uint256 requestId,
        uint64 revealedYes,
        uint64 revealedNo,
        bytes[] memory signatures
    ) external {
        emit DebugCallbackStep("callback_entered", "");
        // FHE.checkSignatures(requestId, signatures); // Uncomment for production
        string memory betId = betIdByRequestId[requestId];
        emit DebugCallbackStep("bet_found", betId);
        BetInfo storage bet = bets[betId];
        bet.revealedYes = revealedYes;
        bet.revealedNo = revealedNo;
        bet.isResolved = true;
        bet.yesWon = revealedYes > revealedNo;
        callbackHasBeenCalled[betId] = true;
        emit CallbackFlagSet(betId);
        emit BetResolved(betId, bet.yesWon, revealedYes, revealedNo, bet.prizePool);
    }

    // Distribute prizes to all winners (to be called after reveal)
    function distributePrizes(string memory betId, address[] calldata winners) external {
        BetInfo storage bet = bets[betId];
        require(bet.isResolved, "Not resolved");
        require(bet.prizePool > 0, "No prize pool");
        require(winners.length > 0, "No winners");
        uint256 prizePerWinner = bet.prizePool / winners.length;
        for (uint i = 0; i < winners.length; i++) {
            pendingWithdrawals[winners[i]] += prizePerWinner;
            emit PrizeDistributed(betId, winners[i], prizePerWinner);
        }
        bet.prizePool = 0;
    }

    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
        emit WithdrawalPending(msg.sender, amount);
    }

    // Get bet info (returns revealed tallies if resolved, otherwise 0)
    function getBet(string memory betId) external view returns (
        address creator,
        uint256 platformStake,
        uint256 voteStake,
        uint256 expiryTime,
        bool isResolved,
        uint64 yesVotes,
        uint64 noVotes,
        uint256 prizePool,
        bool yesWon
    ) {
        BetInfo storage bet = bets[betId];
        return (
            bet.creator,
            bet.platformStake,
            bet.voteStake,
            bet.expiryTime,
            bet.isResolved,
            bet.isResolved ? bet.revealedYes : 0,
            bet.isResolved ? bet.revealedNo : 0,
            bet.prizePool,
            bet.yesWon
        );
    }

    // Get decryption request ID for a bet
    function getDecryptionRequestId(string memory betId) external view returns (uint256) {
        return bets[betId].decryptionRequestId;
    }

    // Get reveal status for a bet
    function getRevealStatus(string memory betId) external view returns (
        bool isResolved,
        uint64 revealedYes,
        uint64 revealedNo,
        uint256 decryptionRequestId
    ) {
        BetInfo storage bet = bets[betId];
        return (
            bet.isResolved,
            bet.revealedYes,
            bet.revealedNo,
            bet.decryptionRequestId
        );
    }

    // Check if a reveal has been requested for a bet
    function isRevealRequested(string memory betId) external view returns (bool) {
        return bets[betId].decryptionRequestId != 0;
    }

    // Check if callback has been called for a bet
    function isCallbackCalled(string memory betId) external view returns (bool) {
        return callbackHasBeenCalled[betId];
    }

    receive() external payable {}
} 