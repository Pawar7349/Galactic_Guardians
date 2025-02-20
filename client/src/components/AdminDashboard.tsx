import React, { useState } from 'react';
import { 
  Container, Typography, Button, Box, Snackbar, Alert 
} from '@mui/material';
import { getContract } from '../utility/contract';


const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<"reveal" | "withdraw" | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Call the reveal() function on the contract
  const handleReveal = async () => {
    setLoading(true);
    setCurrentAction("reveal");
    try {
      const contract = await getContract();
      const tx = await contract.reveal();
      await tx.wait();
      setSnackbarMessage("Collection revealed successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error revealing collection:", error);
      setSnackbarMessage("Error revealing collection: " + error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setCurrentAction(null);
    }
  };

  // Call the withdraw() function on the contract
  const handleWithdraw = async () => {
    setLoading(true);
    setCurrentAction("withdraw");
    try {
      const contract = await getContract();
      const tx = await contract.withdraw();
      await tx.wait();
      setSnackbarMessage("Funds withdrawn successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error withdrawing funds:", error);
      setSnackbarMessage("Error withdrawing funds: " + error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setCurrentAction(null);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        align="center" 
        sx={{ mb: 4, fontFamily: 'Orbitron, sans-serif', color: '#FFFFFF' }}
      >
        Admin Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button 
          variant="contained" 
          onClick={handleReveal} 
          disabled={loading}
          sx={{ width: '250px' }}
        >
          {loading && currentAction === "reveal" ? "Processing..." : "Reveal Collection"}
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleWithdraw} 
          disabled={loading}
          sx={{ width: '250px' }}
        >
          {loading && currentAction === "withdraw" ? "Processing..." : "Withdraw Funds"}
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;
