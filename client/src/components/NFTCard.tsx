
import React from 'react';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface NFTCardProps {
  id: number;
  name: string;
  image: string;
  description: string;
  rarity: string;
  price?: string;
  category?: string;  
  isStaked?: boolean;
}

const NFTCard: React.FC<NFTCardProps> = ({ id, name, image, price }) => {
  return (
    <Card variant="outlined">
      <CardActionArea component={RouterLink} to={`/nft/${id}`}>
        <CardMedia
          component="img"
          image={image}
          alt={name}
          sx={{
            height: 300,
            width: '100%',
            objectFit: 'contain', 
          }}
        />
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {name} #{id}
          </Typography>
          <Typography variant="inherit" sx={{ mt: 1 }}>
            {price && Number(price) > 0 ? `${ price}  ETH` : 'Not for sale'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default NFTCard;




