
import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import NFTCard from './NFTCard';
import { useNFTs } from '../contexts/NFTContext';
import { getContract } from '../utility/contract';

const Collection: React.FC = () => {
  const { nfts, refreshNFTs } = useNFTs();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loadingToken, setLoadingToken] = useState<number | null>(null);

  // Get connected wallet address and update on account change.
  useEffect(() => {
    const updateWalletAddress = async () => {
      try {
        const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
        setWalletAddress(accounts[0] || '');
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      setWalletAddress(accounts[0] || '');
      refreshNFTs();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      updateWalletAddress();
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [refreshNFTs]);

  const handleStake = async (tokenId: number) => {
    try {
      setLoadingToken(tokenId);
      const contract = await getContract();
      const tx = await contract.stake(tokenId);
      await tx.wait();
      refreshNFTs();
    } catch (error) {
      console.error(`Error staking NFT ${tokenId}:`, error);
    } finally {
      setLoadingToken(null);
    }
  };

  const handleUnstake = async (tokenId: number) => {
    try {
      setLoadingToken(tokenId);
      const contract = await getContract();
      const tx = await contract.unstake(tokenId);
      await tx.wait();
      refreshNFTs();
    } catch (error) {
      console.error(`Error unstaking NFT ${tokenId}:`, error);
    } finally {
      setLoadingToken(null);
    }
  };

  // Split NFTs into two groups based on staked status.
  const ownedNFTs = nfts.filter((nft) => !nft.isStaked);
  const stakedNFTs = nfts.filter((nft) => nft.isStaked);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{ fontFamily: 'Orbitron, sans-serif', color: '#FFFFFF', mb: 2 }}
      >
        My NFT Collection
      </Typography>
      <Box textAlign="center" my={2}>
        <Typography variant="subtitle1" sx={{ color: '#00E5FF' }}>
          Connected Wallet:{' '}
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'None'}
        </Typography>
        <Button variant="outlined" onClick={refreshNFTs} sx={{ mt: 1 }}>
          Refresh NFTs
        </Button>
      </Box>

      {nfts.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
          <Typography>No NFTs found in your wallet.</Typography>
        </Box>
      ) : (
        <>
          {/* Section for owned NFTs */}
          <Typography variant="h5" sx={{ color: '#FFFFFF', mt: 4 }} paddingBottom="40px">
            Owned NFTs
          </Typography>
          {ownedNFTs.length === 0 ? (
            <Typography sx={{ color: '#FFFFFF', textAlign: 'center', mt: 2 }}>
              No owned NFTs found.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {ownedNFTs.map((nft) => (
                <Grid item xs={12} sm={6} md={4} key={nft.id}>
                  <NFTCard
                    id={nft.id}
                    name={nft.name}
                    image={nft.image}
                    description={nft.description}
                    rarity={nft.rarity}
                    price={nft.price}
                  />
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleStake(nft.id)}
                      disabled={loadingToken === nft.id}
                    >
                      {loadingToken === nft.id ? 'Processing...' : 'Stake NFT'}
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Section for staked NFTs */}
          <Typography variant="h5" sx={{ color: '#FFFFFF', mt: 4 }} paddingTop="60px" paddingBottom="40px">
            Staked NFTs
          </Typography>
          {stakedNFTs.length === 0 ? (
            <Typography sx={{ color: '#FFFFFF', textAlign: 'center', mt: 2 }}>
              No staked NFTs found.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {stakedNFTs.map((nft) => (
                <Grid item xs={12} sm={6} md={4} key={nft.id}>
                  <NFTCard
                    id={nft.id}
                    name={nft.name}
                    image={nft.image}
                    description={nft.description}
                    rarity={nft.rarity}
                    price={nft.price}
                  />
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleUnstake(nft.id)}
                      disabled={loadingToken === nft.id}
                    >
                      {loadingToken === nft.id ? 'Processing...' : 'Unstake NFT'}
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default Collection;

