
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getContract } from '../utility/contract';
import { transformIPFSUrl } from '../utility/ipfs';
import { ethers } from 'ethers';

interface NFTDetailData {
  id: number;
  name: string;
  image: string;
  description: string;
  rarity: string;
  category: string;
  mintDate?: string;
  creator?: string;
  price?: string; 
  currentOwner?: string;
  isStaked?: boolean;
  stakedSince?: number;
}

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nft, setNft] = useState<NFTDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Modal states for Transfer NFT and List for Sale
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [listModalOpen, setListModalOpen] = useState<boolean>(false);
  const [newSalePrice, setNewSalePrice] = useState<string>('');

  // Store connected account address
  const [connectedAccount, setConnectedAccount] = useState<string>('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch connected wallet address.
  const fetchConnectedAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
        setConnectedAccount(accounts[0] || '');
      } catch (error) {
        console.error('Error fetching connected account:', error);
      }
    }
  };

  // Fetch NFT detail and on-chain data.
  const fetchNFTDetail = async () => {
    try {
      setLoading(true);
      await fetchConnectedAccount();
      const contract = await getContract();
      const tokenId = Number(id);

      // Get tokenURI and transform it.
      let tokenURI = await contract.tokenURI(tokenId);
      tokenURI = transformIPFSUrl(tokenURI);
      const response = await fetch(tokenURI);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      const metadata = await response.json();

      // Fetch on-chain data: current owner.
      const ownerOnChain: string = await contract.ownerOf(tokenId);
      // Get the contract's address for comparison.
      const contractAddress: string = await contract.getAddress();

      let isStaked = false;
      let stakedSince: number | undefined = undefined;
      if (ownerOnChain.toLowerCase() === contractAddress.toLowerCase()) {
        const stakingInfo = await contract.stakedTokens(tokenId);
        isStaked = true;
        stakedSince = Number(stakingInfo.stakedSince);
      }

      // Fetch the current sale price from the mintedNFTs mapping on-chain.
      const mintedData = await contract.mintedNFTs(tokenId);
      // Assume mintedData.cost is a BigNumber. Convert to string.
      const costWei = mintedData.cost ? mintedData.cost.toString() : "0";
      const salePriceOnChain = costWei === "0" ? "0" : ethers.formatEther(costWei);

      // Additional metadata (mintDate, creator) from IPFS.
      const mintDate = metadata.mintDate
        ? new Date(Number(metadata.mintDate) * 1000).toLocaleString()
        : "Not available";
      const creator = metadata.creator || "Unknown";

      const nftData: NFTDetailData = {
        id: tokenId,
        name: metadata.name,
        image: metadata.image, // Optionally transform via transformIPFSUrl if needed.
        description: metadata.description,
        rarity: metadata.rarity || 'common',
        category: metadata.category || 'uncategorized',
        mintDate,
        creator,
        price: salePriceOnChain, // Use on-chain sale price.
        currentOwner: ownerOnChain,
        isStaked,
        stakedSince,
      };

      setNft(nftData);
    } catch (err: any) {
      console.error("Error fetching NFT detail:", err);
      setError(err.message || "Error fetching NFT detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNFTDetail();
    }
  }, [id]);

  const handlePurchase = async () => {
    if (!nft || !nft.price || Number(nft.price) <= 0) {
      setSnackbarMessage("This NFT is not for sale.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      setPurchaseLoading(true);
      const contract = await getContract();
      const tx = await contract.buyGuardian(nft.id, { value: ethers.parseEther(nft.price) });
      await tx.wait();
      setSnackbarMessage("NFT purchased successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchNFTDetail();
    } catch (error: any) {
      console.error("Error purchasing NFT:", error);
      if (error.code === 4001) {
        setSnackbarMessage("Transaction canceled by user.");
      } else {
        setSnackbarMessage("Purchase failed.");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Transfer NFT handler using safeTransferFrom.
  const handleTransfer = async () => {
    if (!nft || !recipientAddress) {
      setSnackbarMessage("Please enter a valid recipient address.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      const contract = await getContract();
      const tx = await contract["safeTransferFrom(address,address,uint256)"](
        nft.currentOwner as string,
        recipientAddress,
        nft.id
      );
      await tx.wait();
      setSnackbarMessage("NFT transferred successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchNFTDetail();
      setTransferModalOpen(false);
    } catch (error: any) {
      console.error("Error transferring NFT:", error);
      setSnackbarMessage("Transfer failed.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleListForSale = async () => {
    if (!nft || !newSalePrice || Number(newSalePrice) <= 0) {
      setSnackbarMessage("Please enter a valid sale price.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      const contract = await getContract();
      const tx = await contract.updateSalePrice(nft.id, ethers.parseEther(newSalePrice));
      await tx.wait();
      setSnackbarMessage("NFT listed for sale successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchNFTDetail();
      setListModalOpen(false);
    } catch (error: any) {
      console.error("Error listing NFT for sale:", error);
      setSnackbarMessage("Listing NFT for sale failed.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress color="secondary" />
        <Typography variant="h6" color="white" sx={{ mt: 2 }}>
          Loading NFT details...
        </Typography>
      </Container>
    );
  }

  if (error || !nft) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="red">
          {error || "NFT not found"}
        </Typography>
        <Button variant="outlined" component={RouterLink} to="/collection" sx={{ mt: 2 }}>
          Back to Collection
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" align="center" sx={{ mb: 4, fontFamily: 'Orbitron, sans-serif', color: '#00E5FF' }}>
        {nft.name} #{nft.id}
      </Typography>
      <Card sx={{ maxWidth: 600, margin: '0 auto', background: 'rgba(0,0,0,0.7)', borderRadius: '8px' }}>
        <CardMedia
          component="img"
          image={transformIPFSUrl(nft.image)}
          alt={nft.name}
          sx={{ maxHeight: 600, objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h6" color="#FFFFFF" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" color="#CCCCCC" sx={{ mb: 2 }}>
            {nft.description}
          </Typography>
          <Typography variant="body2" color="#D500F9">
            Rarity: {nft.rarity}
          </Typography>
          <Typography variant="body2" color="#00E5FF" sx={{ mt: 1 }}>
            Category: {nft.category}
          </Typography>
          <Typography variant="body2" color="#FFFFFF" sx={{ mt: 1 }}>
            Mint Date: {nft.mintDate}
          </Typography>
          <Typography variant="body2" color="#FFFFFF" sx={{ mt: 1 }}>
            Creator: {nft.creator}
          </Typography>
          {nft.price && Number(nft.price) > 0 ? (
            <Typography variant="body2" color="#00E5FF" sx={{ mt: 1 }}>
              Price: {nft.price} ETH
            </Typography>
          ) : (
            <Typography variant="body2" color="#D500F9" sx={{ mt: 1 }}>
              Not for Sale
            </Typography>
          )}
          <Typography variant="body2" color="#FFFFFF" sx={{ mt: 1 }}>
            Current Owner: {nft.currentOwner || "Unknown"}
          </Typography>
          {nft.isStaked && (
            <Typography variant="body2" color="#FFA500" sx={{ mt: 1 }}>
              NFT is currently staked.
            </Typography>
          )}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {nft.price && Number(nft.price) > 0 && nft.currentOwner?.toLowerCase() !== connectedAccount.toLowerCase() && (
              <Button variant="contained" color="primary" onClick={handlePurchase} disabled={purchaseLoading}>
                {purchaseLoading ? 'Processing...' : 'Buy Now'}
              </Button>
            )}
            <Button variant="outlined" color="inherit" component={RouterLink} to="/collection">
              Back to Collection
            </Button>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {nft.currentOwner?.toLowerCase() === connectedAccount.toLowerCase() && (
              <>
                <Button variant="contained" color="secondary" onClick={() => setTransferModalOpen(true)}>
                  Transfer NFT
                </Button>
                <Button variant="contained" color="warning" onClick={() => setListModalOpen(true)}>
                  List for Sale
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Transfer NFT Modal */}
      <Dialog open={transferModalOpen} onClose={() => setTransferModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Transfer NFT</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={handleTransfer}>
              Confirm Transfer
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* List for Sale Modal */}
      <Dialog open={listModalOpen} onClose={() => setListModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>List NFT for Sale</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Sale Price (ETH)"
            type="number"
            value={newSalePrice}
            onChange={(e) => setNewSalePrice(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={handleListForSale}>
              Confirm Listing
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NFTDetail;











