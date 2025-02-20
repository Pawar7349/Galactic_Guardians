
import { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Typography } from '@mui/material';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      return { provider, signer, account: accounts[0] };
    } catch (error) {
      console.error("User rejected request:", error);
      throw new Error("User rejected request");
    }
  } else {
    alert("Please install MetaMask!");
    throw new Error("MetaMask not installed");
  }
};

const WalletConnector = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      const { account } = await connectWallet();
      setAccount(account);
      setError(null);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  return (
    <div>
      <Button 
        variant="contained" 
        onClick={handleConnectWallet}
        sx={{
          background: 'linear-gradient(45deg, #00E5FF 30%, #D500F9 90%)',
          color: 'white',
          marginLeft: 2,
        }}
      >
        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </Button>
      {error && (
        <Typography sx={{ mt: 1, color: 'red' }}>
          {error}
        </Typography>
      )}
    </div>
  );
};

export default WalletConnector;
