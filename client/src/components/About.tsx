import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container>
      <Box my={4} sx={{ textAlign: 'center', maxWidth: '800px', margin: 'auto' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontFamily: 'Orbitron, sans-serif',
            color: '#00E676',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop:"50px"
          }}
        >
          Welcome to Galactic Guardians
        </Typography>
        <Typography variant="body1" sx={{ color: '#B0BEC5', fontSize: '18px', lineHeight: '1.6' }}>
          Step into the cosmos and join an elite force of digital warriors! 
          <strong> Galactic Guardians </strong> is more than just an NFT collection—it's a journey through the stars, where every token holds a tale, and every character has a destiny. 
          Designed for true explorers, our project unites art, technology, and storytelling into a unique experience.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#FFD700', fontWeight: 'bold', marginTop: '16px', fontSize: '18px' }}
        >
          Are you ready to claim your place in the galaxy?  
        </Typography>
      </Box>
    </Container>
  );
};

export default About;
