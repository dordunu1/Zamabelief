import { useMemo } from "react";
import { getBeliefMarketContract } from "../utils/getBeliefMarketContract";
import { useWalletClient } from "wagmi";
import BeliefMarketFHE from '../abi/BeliefMarketFHE.json';

export function useBeliefMarketContract(signerOrProvider?: any) {
  const { data: walletClient } = useWalletClient();
  const effectiveSigner = signerOrProvider || walletClient;
  return useMemo(() => getBeliefMarketContract(effectiveSigner), [effectiveSigner]);
} 