
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/system';
import logo from '../assets/BG_IMG/logo.png';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(15px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 8px rgba(0, 229, 255, 0.5)',
  height: '80px',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
});

const Logo = styled('img')({
  width: '150px',
  height: 'auto',
  marginLeft: '20px',
});
const CustomLink = styled(RouterLink)({
  textDecoration: 'none',
  color: 'inherit',
});

const NeonButton = styled(IconButton)({
  '&:hover': {
    color: '#00E5FF',
    textShadow: '0 0 10px #00E5FF, 0 0 20px #00E5FF',
    transition: 'color 0.3s ease-in-out',
  },
});

const menuItems = [
  { text: 'Home', path: '/' },
  { text: 'Collection', path: '/collection' },
  { text: 'Marketplace', path: '/marketplace' },
  { text: 'About', path: '/about' },
  { text: 'Contact', path: '/contact' },
];

const iconItems = [
  { icon: <FontAwesomeIcon icon={faDiscord} />, path: 'https://discord.com/users/1238565845312082005' },
  { icon: <FontAwesomeIcon icon={faXTwitter} />, path: 'https://x.com/PratikP43786754' },
];

const AdvancedNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMobileMenuOpen(prev => !prev);
  };

  
  useEffect(() => {
    const handleDocumentClick = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isMobileMenuOpen]);

  return (
    <StyledAppBar position="sticky">
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <CustomLink to="/">
          <Logo 
            src={logo} 
            alt="Galactic Guardians Logo"
          />
        </CustomLink>
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexGrow: 1,
          }}
        >
          {menuItems.map((item, index) => (
            <Typography
              key={index}
              component={RouterLink}
              to={item.path}
              variant="h6"
              color="#FFFFFF"
              sx={{
                margin: '0 20px',
                textDecoration: 'none',
                '&:hover': { color: '#00E5FF' },
              }}
            >
              {item.text}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '20px', alignItems: 'center' }}>
          {iconItems.map((item, index) => (
            <NeonButton
              key={index}
              component={RouterLink as any}
              to={item.path}
              color="inherit"
              sx={{ alignItems: 'center' }}
            >
              {item.icon}
            </NeonButton>
          ))}
        </Box>

        <IconButton
          color="inherit"
          aria-label="open menu"
          edge="start"
          onClick={toggleMobileMenu}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {isMobileMenuOpen && (
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              position: 'absolute',
              top: '80px',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1200,
              p: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, index) => (
              <Typography
                key={index}
                component={RouterLink}
                to={item.path}
                variant="h6"
                color="#FFFFFF"
                sx={{
                  py: 1,
                  textDecoration: 'none',
                  '&:hover': { color: '#00E5FF' },
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.text}
              </Typography>
            ))}
            <Box
              sx={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2,
              }}
            >
              {iconItems.map((item, index) => (
                <NeonButton
                  key={index}
                  component={RouterLink as any}
                  to={item.path}
                  color="inherit"
                  sx={{ alignItems: 'center' }}
                >
                  {item.icon}
                </NeonButton>
              ))}
            </Box>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default AdvancedNavbar;
