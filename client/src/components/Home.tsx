
import React, { useState } from 'react';
import { Container, Typography, IconButton, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Parallax } from 'react-parallax';
import CustomButton from './CustomButton';
import bg1 from '../assets/BG_IMG/bg1.png';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faXTwitter } from '@fortawesome/free-brands-svg-icons';


const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleExploreCollection = () => {
    navigate('/collection');
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* HERO SECTION */}
      <Parallax bgImage={bg1} strength={500}>
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Container sx={{ textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 0 5px #00E5FF, 0 0 10px #00E5FF, 0 0 15px #00E5FF, 0 0 20px #00E5FF',
                  color: '#FFFFFF',
                  mb: 2,
                }}
              >
                Welcome to Galactic Guardians
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <Typography 
              variant="h6" 
              sx={{ color: '#FFFFFF', mb: 4}}
              >
                Explore the universe of our unique NFT collection.
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <CustomButton
                onClick={handleExploreCollection}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Explore Collection 
                <motion.span
                  animate={{ x: isHovered ? 10 : 0 }}
                  style={{ marginLeft: 8 }}
                >
                »»
                </motion.span>
              </CustomButton>
            </motion.div>
          </Container>
        </Box>
      </Parallax>

      {/* FEATURES SECTION */}
      <Parallax bgImage={bg1} strength={300}>
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Add a semi-transparent overlay for better text contrast
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <Container sx={{ textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <Typography variant="h4" sx={{ color: '#00E5FF', mb: 2 }}>
                Discover Our Unique Features
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.5 }}
            >
              <Typography
                variant="body1"
                sx={{ color: '#FFFFFF', maxWidth: 600, mx: 'auto' }}
              >
                Each NFT tells a story and represents a piece of art. Dive into the lore and
                discover the hidden secrets of the Galactic Guardians universe.
              </Typography>
            </motion.div>
          </Container>
        </Box>
      </Parallax>

      {/* COMMUNITY SECTION */}
      <Box sx={{ py: 6, backgroundColor: '#000', color: '#FFF' }}>
        <Container sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Join Our Community
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
            Connect with other enthusiasts and stay updated with our latest releases.
          </Typography>
          <motion.div
            style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <IconButton
              onClick={() => handleSocialClick('https://discord.com/users/1238565845312082005')}
              sx={{
                color: '#ffffff',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <FontAwesomeIcon icon={faDiscord} size="2x" />
            </IconButton>
            <IconButton
              onClick={() => handleSocialClick('https://x.com/PratikP43786754')}
              sx={{
                color: '#ffffff',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            >
              <FontAwesomeIcon icon={faXTwitter} size="2x" />
            </IconButton>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;




















