# Architecture

## Smart Contract: BeliefMarketFHE

### Key Concepts
- **BetInfo struct:** Stores all market data (creator, stakes, expiry, tallies, prize pool, etc.)
- **Mappings:** Track votes, claims, and user participation
- **Claim-based payout:** No mass distribution, only user-initiated claims

### Prominent Functions
- `createBet`: Create a new market
- `vote`: Cast an encrypted vote (see Voting Mechanism below)
- `requestTallyReveal`: Trigger decryption and resolution (see below)
- `resolveTallyCallback`: Oracle callback to reveal tallies (see below)
- `claimPrize` / `claimRefund`: User-initiated reward/refund
- `hasUserClaimed`: Public getter for frontend UX
- `getBet`, `getRevealStatus`, `isRevealRequested`, `isCallbackCalled`: Various getters for frontend and monitoring

---

## Voting Mechanism

### Frontend Voting Flow
- The user selects their prediction (Yes/No) and amount to stake.
- The frontend uses ZAMA FHE Relayer to **encrypt the vote stake** in the browser.
- The encrypted vote, along with the vote type and a zero-knowledge proof, is sent to the smart contract via the `vote` function.
- Example (React/TypeScript):

```typescript
const { castConfidentialVote } = useCastVote();
await castConfidentialVote({
  contractAddress: contract.address,
  abi: BeliefMarketABI.abi,
  betId: market.betId,
  marketId: market.id,
  voteType: selectedOption === 'yes' ? 1 : 0,
  voteStake: ethers.utils.parseEther(market.minBet.toString()).toString(),
  signer,
  setVoteStep,
  onCastVote: () => { /* ... */ }
});
```
- The frontend ensures FHEVM is initialized before voting, and provides user feedback ("Initializing...", "Voting...").

### Smart Contract Voting Logic
- The contract receives the encrypted vote and proof.
- It verifies the proof and updates the encrypted tallies for Yes/No.
- The user's vote type and claim status are tracked for later prize/refund eligibility.

```solidity
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
    userVoteType[betId][msg.sender] = voteType;
    bet.prizePool += msg.value;
    emit VoteCast(betId);
}
```
- **What it does:**
  - Verifies the market and vote validity
  - Decrypts and verifies the encrypted vote using FHEVM
  - Updates the encrypted tallies for Yes/No
  - Tracks the user's vote and eligibility for claims
  - Increases the prize pool
  - Emits an event for off-chain tracking

---

#### Example: Tally Request and Oracle Operation

##### 1. **requestTallyReveal**
This function is called by the market creator after expiry to request decryption of the encrypted tallies. It interacts with the FHEVM oracle/relayer.

```solidity
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
```
- **What it does:**
  - Prepares the encrypted tallies for decryption
  - Calls the FHEVM relayer/oracle to request decryption
  - Stores the requestId for tracking
  - Emits an event for off-chain monitoring

##### 2. **resolveTallyCallback**
This function is called by the FHEVM oracle/relayer when the decryption is ready. It finalizes the market resolution.

```solidity
function resolveTallyCallback(
    uint256 requestId,
    uint64 revealedYes,
    uint64 revealedNo,
    bytes[] memory signatures
) external {
    string memory betId = betIdByRequestId[requestId];
    BetInfo storage bet = bets[betId];
    bet.revealedYes = revealedYes;
    bet.revealedNo = revealedNo;
    bet.isResolved = true;
    bet.yesWon = revealedYes > revealedNo;
    callbackHasBeenCalled[betId] = true;
    emit BetResolved(betId, bet.yesWon, revealedYes, revealedNo, bet.prizePool);
}
```
- **What it does:**
  - Receives the decrypted tallies from the oracle
  - Updates the market state with the revealed results
  - Marks the market as resolved
  - Emits an event for frontend and analytics

##### 3. **Oracle/Relayer Role**
- The FHEVM oracle/relayer is an off-chain service that:
  - Receives decryption requests from the contract
  - Performs secure decryption of encrypted tallies
  - Calls back the contract with the revealed results
  - Ensures only valid, authorized decryption is performed

---

## Frontend Architecture
- **React + TypeScript**
- **Hooks** for contract interaction (e.g., useCastVote, useMarkets)
- **RainbowKit/Wagmi** for wallet connection
- **Conditional FHEVM initialization** for privacy features

## FHEVM Integration
- Votes are encrypted in-browser using ZAMA FHEVM
- Decryption and tallying occur on-chain after market expiry

## Firestore Usage
- Used for off-chain data (comments, activity feed, etc.)
- Not critical for market resolution or payouts

## Security Considerations
- No mass distribution (prevents gas griefing)
- All critical logic is on-chain and verifiable
- User privacy is protected via FHEVM

---

See the contract and frontend code for more technical details. 