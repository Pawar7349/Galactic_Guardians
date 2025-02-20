
import { useNavigate } from 'react-router-dom';
import { useNFTs } from '../contexts/NFTContext';
import CreateNFT from './CreateNFT';

const CreateNFTWrapper = () => {
  const { refreshNFTs } = useNFTs();
  const navigate = useNavigate();

  const handleMintSuccess = async () => {
    await refreshNFTs();
    navigate('/collection');
  };

  return <CreateNFT onMintSuccess={handleMintSuccess} />;
};

export default CreateNFTWrapper;
