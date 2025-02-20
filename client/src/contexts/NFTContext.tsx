
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getContract } from '../utility/contract';
import { ethers } from 'ethers';


interface TransactionStruct {
  owner: string;
  cost: any; 
  title: string;
  description: string;
  metadataURI: string;
  timestamp: any; 
}


interface GalacticGuardiansContract {
  ownerOf(tokenId: number): Promise<string>;
  stakedTokens(tokenId: number): Promise<{ stakedSince: number; owner: string }>;
  tokenURI(tokenId: number): Promise<string>;
  tokenRarity(tokenId: number): Promise<number>;
  totalSupply(): Promise<bigint>; 
  mintedNFTs(tokenId: number): Promise<TransactionStruct>;
  getAddress(): Promise<string>;
  address: string;
}


export interface NFT {
  id: number;
  name: string;
  image: string;
  description: string;
  rarity: string;
  category: string;
  isMinted: boolean;
  price?: string;
  isStaked?: boolean;
  stakedSince?: number;
}

interface NFTContextType {
  nfts: NFT[];
  refreshNFTs: () => Promise<void>;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

// Helper function to convert IPFS URIs to HTTP URLs.
const convertIPFSUrl = (uri: string): string => {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  if (!uri.startsWith('http')) {
    return `https://ipfs.io/ipfs/${uri}`;
  }
  return uri;
};

export const NFTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);

  // Function to refresh NFT data.
  const refreshNFTs = async () => {
    try {
      const contract = (await getContract()) as unknown as GalacticGuardiansContract;
      // Get the contract address.
      const contractAddress = contract.address || (contract as any).target;
      if (!contractAddress) {
        console.error("Contract address is not defined");
        return;
      }
      // Get the connected wallet account.
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
      const connectedAccount = accounts[0];
      if (!connectedAccount) {
        console.error("No connected account found");
        return;
      }
      // Get total supply as bigint and convert to number.
      const totalSupplyBN: bigint = await contract.totalSupply();
      const totalSupply = Number(totalSupplyBN);
      const loadedNFTs: NFT[] = [];

      for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        try {
          // Get token URI and convert it.
          let tokenURI = await contract.tokenURI(tokenId);
          tokenURI = convertIPFSUrl(tokenURI);

          // Fetch metadata.
          const response = await fetch(tokenURI);
          if (!response.ok) {
            throw new Error(`Failed to fetch metadata for token ${tokenId}: ${response.statusText}`);
          }
          const metadata = await response.json();
          if (!metadata || typeof metadata !== 'object') {
            throw new Error('Invalid metadata format');
          }
          const requiredFields = ['name', 'image', 'description'];
          for (const field of requiredFields) {
            if (!metadata[field]) {
              throw new Error(`Missing required field: ${field}`);
            }
          }
          if (metadata.image?.startsWith('ipfs://')) {
            const imageCidPath = metadata.image.replace('ipfs://', '');
            metadata.image = convertIPFSUrl(`ipfs://${imageCidPath}`);
          }
          const rarityNum = await contract.tokenRarity(tokenId);
          const rarityStr = ["Common", "Rare", "Epic", "Legendary"][Number(rarityNum)] || "Common";

          // Get the on-chain owner.
          const owner: string = await contract.ownerOf(tokenId);

          // Check staking status.
          let isStakedByUser = false;
          let stakedSince: number | undefined = undefined;
          try {
            const stakingInfo = await contract.stakedTokens(tokenId);
            if (
              stakingInfo.owner &&
              stakingInfo.owner.toLowerCase() === connectedAccount.toLowerCase()
            ) {
              isStakedByUser = true;
              stakedSince = stakingInfo.stakedSince;
            }
          } catch (e) {
            console.warn(`Error fetching staking info for token ${tokenId}`, e);
          }

          // Include token if owned by connected account OR if staked by connected account.
          if (
            owner.toLowerCase() !== connectedAccount.toLowerCase() &&
            !isStakedByUser
          ) {
            continue;
          }

          // Fetch the on-chain sale price from mintedNFTs mapping.
          const mintedData = await contract.mintedNFTs(tokenId);
          const costWei = mintedData.cost ? mintedData.cost.toString() : "0";
          const salePriceOnChain = costWei === "0" ? "0" : ethers.formatEther(costWei);

          loadedNFTs.push({
            id: tokenId,
            name: metadata.name,
            image: metadata.image,
            description: metadata.description,
            rarity: rarityStr,
            category: metadata.category || 'uncategorized',
            isMinted: true,
            price: salePriceOnChain,
            isStaked: isStakedByUser,
            stakedSince: stakedSince,
          });
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error);
        }
      }
      setNfts(loadedNFTs);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    }
  };

  // Setup event listener to refresh NFTs on Transfer.
  useEffect(() => {
    let contractInstance: any = null;
    const setupListener = async () => {
      const c = await getContract();
      contractInstance = c;
      contractInstance.on("Transfer", (_from: string, _to: string, tokenId: any) => {
        console.log("Transfer event detected for token:", tokenId.toString());
        refreshNFTs();
      });
    };

    setupListener();

    return () => {
      if (contractInstance) {
        contractInstance.removeAllListeners("Transfer");
      }
    };
  }, [refreshNFTs]);

  useEffect(() => {
    refreshNFTs();
  }, []);

  return (
    <NFTContext.Provider value={{ nfts, refreshNFTs }}>
      {children}
    </NFTContext.Provider>
  );
};

export const useNFTs = () => {
  const context = useContext(NFTContext);
  if (!context) throw new Error('useNFTs must be used within an NFTProvider');
  return context;
};















