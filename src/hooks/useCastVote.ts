import { getFheInstance } from '../utils/fheInstance';
import { ethers } from 'ethers';
import { getAddress, hexlify } from 'ethers/lib/utils';

export function useCastVote() {
  const castConfidentialVote = async ({
    contractAddress,
    abi,
    betId,
    marketId, // Add marketId parameter for Firestore
    voteType, // 0 or 1
    voteStake, // the amount to encrypt (e.g., 1 for 1 vote, or token balance)
    signer,
    setVoteStep, // optional: for UI feedback
    onCastVote, // optional: callback after success
  }: {
    contractAddress: string;
    abi: any;
    betId: string;
    marketId: string; // Add this parameter
    voteType: number;
    voteStake: number | string | bigint;
    signer: ethers.Signer;
    setVoteStep?: (step: string) => void;
    onCastVote?: (voteType: number, amount: number) => void;
  }) => {
    try {
      const fhe = getFheInstance();
      if (!fhe) throw new Error('FHE instance not initialized');

      const contractAddressChecksum = getAddress(contractAddress) as `0x${string}`;
      const userAddress = await signer.getAddress();

      // Encrypt the vote stake
      console.log('Encrypting vote stake:', {
        contractAddress: contractAddressChecksum,
        userAddress,
        voteStake,
        voteType
      });
      const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
      ciphertext.add64(BigInt(voteStake));
      const { handles, inputProof } = await ciphertext.encrypt();
      const encryptedHex = hexlify(handles[0]);
      const proofHex = hexlify(inputProof);
      console.log('Encrypted vote:', { encryptedHex, proofHex });

      if (setVoteStep) setVoteStep('casting');

      // Call the contract's vote function
      console.log('Calling contract.vote with:', {
        betId,
        encryptedHex,
        voteType,
        proofHex
      });
      const contract = new ethers.Contract(contractAddressChecksum, abi, signer);
      const tx = await contract.vote(
        betId,
        encryptedHex,
        voteType,
        proofHex,
        { 
          gasLimit: 1000000,
          value: voteStake // Send the vote stake as ETH with the transaction
        }
      );
      await tx.wait();

      // Write vote to Firestore for UI display
      try {
        const { db } = await import('../firebase');
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, `markets/${marketId}/votes`), {
          marketId: marketId,
          user: userAddress,
          option: voteType === 1 ? 'yes' : 'no',
          amount: typeof voteStake === 'string' ? parseFloat(voteStake) : Number(voteStake),
          createdAt: Date.now(),
        });
      } catch (firestoreErr) {
        console.warn('Failed to write vote to Firestore:', firestoreErr);
        // Don't fail the whole transaction if Firestore fails
      }

      if (onCastVote) onCastVote(voteType, typeof voteStake === 'string' ? parseFloat(voteStake) : Number(voteStake));
    } catch (err) {
      console.error('Error in castConfidentialVote:', err);
      throw err;
    }
  };
  return { castConfidentialVote };
} 