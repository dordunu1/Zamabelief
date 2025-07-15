import { ethers } from "ethers";
import BeliefMarketABI from '../abi/BeliefMarketFHE.json';


const CONTRACT_ADDRESS = import.meta.env.VITE_BELIEF_MARKET_ADDRESS;

export function getBeliefMarketContract(providerOrSigner: ethers.Signer | ethers.providers.Provider) {
  if (!CONTRACT_ADDRESS) throw new Error("VITE_BELIEF_MARKET_ADDRESS env variable not set");
  return new ethers.Contract(CONTRACT_ADDRESS, BeliefMarketABI.abi, providerOrSigner);
} 