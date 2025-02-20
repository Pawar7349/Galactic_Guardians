
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
  IconButton,
  styled,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import NFTCard from './NFTCard';
import CreateNFT from './CreateNFT';
import { getContract } from '../utility/contract';
import { CID } from 'multiformats/cid';
import { base32 } from 'multiformats/bases/base32';
import { ethers } from 'ethers';

interface NFT {
  id: number;
  name: string;
  image: string;
  description: string;
  rarity: string;
  price: string;
  category: string;
}

const CustomLink = styled(RouterLink)({
  textDecoration: 'none',
  color: 'inherit',
});

const Rarity = ["Common", "Rare", "Epic", "Legendary"];

const Marketplace: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openCreateNFT, setOpenCreateNFT] = useState<boolean>(false);
  const { collectionId } = useParams<{ collectionId: string }>();

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [loadingToken, setLoadingToken] = useState<number | null>(null);

  // State to track if connected account is the contract owner
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Check contract ownership
  useEffect(() => {
    const checkOwner = async () => {
      try {
        const contract = await getContract();
        const ownerAddress: string = await contract.owner();
        const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
        const connectedAccount = accounts[0]?.toLowerCase() || '';
        setIsOwner(ownerAddress.toLowerCase() === connectedAccount);
      } catch (error) {
        console.error('Error checking owner:', error);
      }
    };
    checkOwner();
  }, []);

  // Function to trigger reveal (owner-only)
  // const triggerReveal = async () => {
  //   try {
  //     const contract = await getContract();
  //     const tx = await contract.reveal();
  //     await tx.wait();
  //     console.log("Collection revealed successfully!");
  //   } catch (error) {
  //     console.error("Error triggering reveal:", error);
  //   }
  // };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Helper: format IPFS URLs.
  const formatIPFSUrl = (uri: string): string[] => {
    if (!uri.includes('ipfs://')) return [uri];
    const cidPath = uri.replace('ipfs://', '');
    const [cidStr, ...pathSegments] = cidPath.split('/');
    const path = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';
    let cidv1Base32: string | null = null;
    try {
      const cid = CID.parse(cidStr);
      cidv1Base32 = cid.toV1().toString(base32);
    } catch (error) {
      console.warn('Invalid CID format:', cidStr, error);
    }
    if (cidv1Base32) {
      return [
        `https://${cidv1Base32}.ipfs.dweb.link${path}`,
        `https://${cidv1Base32}.ipfs.cf-ipfs.com${path}`,
        `https://cyan-obliged-mosquito-971.mypinata.cloud/ipfs/${cidStr}${path}`,
        `https://ipfs.io/ipfs/${cidStr}${path}`,
      ];
    } else {
      return [
        `https://cyan-obliged-mosquito-971.mypinata.cloud/ipfs/${cidStr}${path}`,
        `https://ipfs.io/ipfs/${cidStr}${path}`,
      ];
    }
  };

  const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    for (let i = 0; i < retries; i++) {
      try {
        const headers: HeadersInit = {};
        if (url.includes('pinata.cloud')) {
          headers['Authorization'] = `Bearer ${import.meta.env.VITE_PINATA_JWT}`;
        }
        const response = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response;
      } catch (error) {
        if (i === retries - 1) {
          clearTimeout(timeoutId);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  };

  // Load NFTs for Marketplace.
  // Only include NFTs that:
  //   - Have a sale price > 0.
  //   - Are not owned by the connected account.
  //   - Are not staked (owner equals the contract address).
  const loadNFTs = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = await getContract();
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
      const account = accounts[0]?.toLowerCase() || '';
      const totalSupply = await contract.totalSupply();
      const contractAddress = (await contract.getAddress()).toLowerCase();
      const loadedNFTs: NFT[] = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          const tokenURI = await contract.tokenURI(i);
          const gatewayUrls = formatIPFSUrl(tokenURI);
          let metadata: any = null;
          for (const url of gatewayUrls) {
            try {
              const response = await fetchWithRetry(url);
              metadata = await response.json();
              break;
            } catch (error) {
              console.warn(`Failed with gateway ${url}:`, error);
            }
          }
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
            metadata.image = formatIPFSUrl(`ipfs://${imageCidPath}`)[0];
          }
          const rarity = await contract.tokenRarity(i);
          const transaction = await contract.mintedNFTs(i);
          const costWei = transaction.cost ? transaction.cost.toString() : "0";
          const salePriceOnChain = costWei === "0" ? "0" : ethers.formatEther(costWei);

          const actualOwner = (await contract.ownerOf(i)).toLowerCase();
          // Filtering: skip NFTs owned by connected account, staked (owned by contract), or not for sale.
          if (actualOwner === account) continue;
          if (actualOwner === contractAddress) continue;
          if (Number(salePriceOnChain) === 0) continue;

          loadedNFTs.push({
            id: i,
            name: metadata.name,
            image: metadata.image,
            description: metadata.description,
            rarity: Rarity[Number(rarity)],
            price: salePriceOnChain,
            category: metadata.category || "collection",
          });
        } catch (error) {
          console.error(`Error loading NFT ${i}:`, error);
        }
      }
      setNfts(loadedNFTs);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  useEffect(() => {
    const handleAccountsChanged = (_accounts: string[]) => {
      loadNFTs();
    };
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [loadNFTs]);

  const handleMintSuccess = () => {
    loadNFTs();
  };

  const handlePurchase = async (tokenId: number, price: string) => {
    try {
      setLoadingToken(tokenId);
      const contract = await getContract();
      const tx = await contract.buyGuardian(tokenId, { value: ethers.parseEther(price) });
      await tx.wait();
      console.log(`NFT ${tokenId} purchased successfully!`);
      loadNFTs();
    } catch (error: any) {
      console.error(`Error purchasing NFT ${tokenId}:`, error);
      if (error.reason && error.reason.includes("Invalid buyer")) {
        setSnackbarMessage(`You cannot purchase your own NFT.`);
      } else {
        setSnackbarMessage(`Purchase of NFT ${tokenId} failed.`);
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingToken(null);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ fontFamily: 'Orbitron, sans-serif', color: '#FFFFFF', marginBottom: '16px' }}>
        Marketplace - Collection {collectionId}
      </Typography>
      
      {/* Better UI for Reveal & Create NFT buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        {/* {isOwner && (
          <Button variant="contained" onClick={triggerReveal} sx={{ backgroundColor: '#00E5FF', color: '#000' }}>
            Reveal Collection
          </Button>
        )} */}
        <Button variant="contained" onClick={() => setOpenCreateNFT(true)} sx={{ backgroundColor: '#00E5FF', color: '#000' }}>
          Create NFT
        </Button>
      </Stack>

      <Dialog open={openCreateNFT} onClose={() => setOpenCreateNFT(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create NFT</DialogTitle>
        <DialogContent>
          <CreateNFT onMintSuccess={handleMintSuccess} />
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <Typography variant="h6" color="white">Loading NFTs...</Typography>
      ) : (
        <Grid container spacing={4}>
          {nfts.map((nft, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                component={motion.div}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 229, 255, 0.7)' }}
                sx={{ background: 'rgba(0, 0, 0, 0.7)', borderRadius: '8px', overflow: 'hidden'}}
              >
                <NFTCard
                  id={nft.id}
                  name={nft.name}
                  image={nft.image}
                  description={nft.description}
                  rarity={nft.rarity}
                  price={nft.price}
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '3px',
                  }}
                >
                  <Button 
                    variant="contained" 
                    onClick={() => handlePurchase(nft.id, nft.price)} 
                    disabled={loadingToken === nft.id}
                  >
                    {loadingToken === nft.id ? 'Processing...' : 'Buy'}
                  </Button>
                  <CustomLink to="/cart">
                    <IconButton color="primary">
                      <ShoppingCartIcon />
                    </IconButton>
                  </CustomLink>
                  
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Marketplace;









