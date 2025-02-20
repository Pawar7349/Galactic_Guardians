// components/MarketplaceNavbar.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar, 
  Button, 
  IconButton, 
  styled, 
  Box, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItemText 
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import WalletConnector from '../utility/WalletConnector';
import logo from '../assets/BG_IMG/logo.png';

const StyledAppBar = styled(AppBar)({
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(15px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 8px rgba(0, 229, 255, .5)',
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

const MarketplaceNavbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  const theme = useTheme();
  // Using "md" breakpoint so that it works for tablet/desktop and mobile devices
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle the drawer open/close for mobile
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Dropdown state for Featured section
  const [anchorElFeatured, setAnchorElFeatured] = useState<null | HTMLElement>(null);
  const handleFeaturedClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElFeatured(event.currentTarget);
  };
  const handleFeaturedClose = () => {
    setAnchorElFeatured(null);
  };

  // Dropdown state for New Arrivals section
  const [anchorElNew, setAnchorElNew] = useState<null | HTMLElement>(null);
  const handleNewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElNew(event.currentTarget);
  };
  const handleNewClose = () => {
    setAnchorElNew(null);
  };

  // Navigation links to be shown on desktop with dropdown menus
  const navLinks = (
    <>
      <CustomLink to="/marketplace">
        <Button
          color="inherit"
          sx={
            isActive('/marketplace')
              ? { fontWeight: 'bold', borderBottom: '2px solid #00E5FF' }
              : {}
          }
        >
          All NFTs
        </Button>
      </CustomLink>

      {/* Featured Dropdown */}
      <Button
        color="inherit"
        onClick={handleFeaturedClick}
        sx={
          isActive('/marketplace/featured')
            ? { fontWeight: 'bold', borderBottom: '2px solid #00E5FF' }
            : {}
        }
      >
        Featured
      </Button>
      <Menu
        anchorEl={anchorElFeatured}
        open={Boolean(anchorElFeatured)}
        onClose={handleFeaturedClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem
          onClick={handleFeaturedClose}
          component={RouterLink}
          to="/marketplace/featured/top-rated"
        >
          Top Rated
        </MenuItem>
        <MenuItem
          onClick={handleFeaturedClose}
          component={RouterLink}
          to="/marketplace/featured/editors-pick"
        >
          Editor's Pick
        </MenuItem>
        <MenuItem
          onClick={handleFeaturedClose}
          component={RouterLink}
          to="/marketplace/featured/trending"
        >
          Trending
        </MenuItem>
      </Menu>

      {/* New Arrivals Dropdown */}
      <Button
        color="inherit"
        onClick={handleNewClick}
        sx={
          isActive('/marketplace/new')
            ? { fontWeight: 'bold', borderBottom: '2px solid #00E5FF' }
            : {}
        }
      >
        New Arrivals
      </Button>
      <Menu
        anchorEl={anchorElNew}
        open={Boolean(anchorElNew)}
        onClose={handleNewClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem
          onClick={handleNewClose}
          component={RouterLink}
          to="/marketplace/new/latest"
        >
          Latest
        </MenuItem>
        <MenuItem
          onClick={handleNewClose}
          component={RouterLink}
          to="/marketplace/new/this-week"
        >
          This Week
        </MenuItem>
        <MenuItem
          onClick={handleNewClose}
          component={RouterLink}
          to="/marketplace/new/this-month"
        >
          This Month
        </MenuItem>
      </Menu>
    </>
  );

  // Drawer list for mobile navigation (simplified)
  const drawerList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItemButton component={RouterLink} to="/marketplace">
          <ListItemText primary="All NFTs" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/marketplace/featured">
          <ListItemText primary="Featured" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/marketplace/new">
          <ListItemText primary="New Arrivals" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
      <CustomLink to="/">
      <Logo 
        src={logo} 
        alt="Galactic Guardians Logo"
        />
      </CustomLink>
        

        {isMobile ? (
          <>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
              }}
            />
            <IconButton color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
              {drawerList}
            </Drawer>
          </>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            {navLinks}
          </Box>
        )}

        <CustomLink to="/cart">
          <IconButton color="inherit"> 
            <ShoppingCartIcon />
          </IconButton>
        </CustomLink>

        <WalletConnector />
      </Toolbar>
    </StyledAppBar>
  );
};

export default MarketplaceNavbar;
