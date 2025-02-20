// src/utils/contract.ts
import { ethers } from 'ethers';
import GalacticGuardiansABI from '../artifacts/contracts/GalacticGuardians.sol/GalacticGuardians.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error("VITE_CONTRACT_ADDRESS is not set in your environment variables.");
}

export const getContract = async () => {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(
    contractAddress,
    GalacticGuardiansABI.abi,
    signer
  );
};
