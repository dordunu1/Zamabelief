import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

let fheInstance: any = null;

export async function initializeFheInstance() {
  // Check if ethereum is available (prevents mobile crashes)
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
  }

  await initSDK(); // Loads WASM
  const config = { ...SepoliaConfig, network: window.ethereum };
  try {
    fheInstance = await createInstance(config);
    console.log('FHEVM instance created:', fheInstance);
    return fheInstance;
  } catch (err) {
    console.error('FHEVM instance creation failed:', err);
    throw err;
  }
}

export function getFheInstance() {
  return fheInstance;
} 

// Decrypt a single encrypted value using the relayer
export async function decryptValue(encryptedBytes: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');

  try {
    // Always pass an array of hex strings
    let handle = encryptedBytes;
    if (typeof handle === "string" && handle.startsWith("0x") && handle.length === 66) {
      const values = await fhe.publicDecrypt([handle]);
      // values is an object: { [handle]: value }
      return Number(values[handle]);
    } else {
      throw new Error('Invalid ciphertext handle for decryption');
    }
  } catch (error: any) {
    // Check for relayer/network error
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      throw new Error('Decryption service is temporarily unavailable. Please try again later.');
    }
    throw error;
  }
} 