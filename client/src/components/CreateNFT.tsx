
import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { getContract } from '../utility/contract';
import { connectWallet } from '../utility/WalletConnector';
import { Button, CircularProgress, Typography, TextField, Box } from '@mui/material';
import FormData from 'form-data';

interface CreateNFTProps {
  onMintSuccess: () => void;
}

const CreateNFT: React.FC<CreateNFTProps> = ({ onMintSuccess }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const validateForm = () => {
    if (!title || !price || !description || !file) {
      setStatus('Please fill all fields and upload an image.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsMinting(true);
    setStatus('Uploading to IPFS...');
    
    try {
      await connectWallet();
      const formData = new FormData();
      formData.append('file', file as File);

      const imageResult = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageHash = imageResult.data.IpfsHash;
      const imageUrl = `ipfs://${imageHash}`;

      // Create metadata for the NFT
      const metadata = {
        name: title,
        description,
        image: imageUrl,
        price,
      };

      // Upload metadata JSON to IPFS via Pinata
      const metadataResult = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
          },
        }
      );

      console.log('Image CID:', imageHash);
      console.log('Metadata CID:', metadataResult.data.IpfsHash);

      const metadataURI = `ipfs://${metadataResult.data.IpfsHash}`;

      // Mint NFT
      setStatus('Minting NFT...');
      const contract = await getContract();
      const tx = await contract.mintGuardian(
        title,
        description,
        metadataURI,
        ethers.parseEther(price), // Convert sale price to wei
        { value: ethers.parseEther("0.08") } // Minting fee
      );
      await tx.wait();
      setStatus('NFT minted successfully!');
      resetForm();
      onMintSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        setStatus(`Error: ${error.response?.data?.error || error.message}`);
      } else {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Minting failed'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus('');
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setStatus('Invalid file type. Please upload an image (PNG, JPEG, GIF, or WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setStatus('File size too large. Please upload an image smaller than 5MB.');
        return;
      }
      setFile(file);
      previewFile(file);
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => e.target?.result && setPreview(e.target.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setFile(null);
    setPreview(null);
    setTimeout(() => setStatus(''), 5000);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3, border: '1px solid #00E5FF', borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', color: '#00E5FF' }}>
        Create NFT
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Price (ETH)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        <input
          type="file"
          accept="image/png, image/gif, image/jpeg, image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="upload-file"
          required
        />
        <label htmlFor="upload-file">
          <Button variant="contained" component="span" fullWidth sx={{ mb: 2, background: '#00E5FF', color: '#000' }}>
            Upload Image
          </Button>
        </label>
        {preview && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
          </Box>
        )}
        <Button type="submit" variant="contained" fullWidth disabled={isMinting} sx={{ background: '#00E5FF', color: '#000' }}>
          {isMinting ? <CircularProgress size={24} /> : 'Mint NFT'}
        </Button>
        {status && (
          <Typography sx={{ mt: 2, textAlign: 'center', color: status.includes('Error') ? 'red' : '#00E5FF' }}>
            {status}
          </Typography>
        )}
      </form>
    </Box>
  );
};

export default CreateNFT;
