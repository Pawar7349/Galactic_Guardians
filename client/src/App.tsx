// App.tsx
import React from 'react';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import theme from './theme';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Collection from './components/collection'; // renamed from Gallery.tsx
import MarketplaceNavbar from './components/MarketplaceNavbar';
import Marketplace from './components/Marketplace';
import NFTDetail from './components/NFTDetail';
import About from './components/About';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import CreateNFTWrapper from './components/createNFTWrapper';
import AdminDashboard from './components/AdminDashboard';


import { NFTProvider } from './contexts/NFTContext';

// Main layout for non-marketplace routes
const MainLayout = () => (
  <>
    <Navbar />
    <Container maxWidth="lg">
      <Outlet />
    </Container>
  </>
);

// Marketplace-specific layout
const MarketplaceLayout = () => (
  <>
    <MarketplaceNavbar />
    <Container maxWidth="xl">
      <Outlet />
    </Container>
  </>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Wrap all routes with NFTProvider so that any component can access the NFT context */}
        <NFTProvider>
          <Routes>
            {/* Main app routes with standard navbar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/nft/:id" element={<NFTDetail />} />
              <Route path="/create-nft" element={<CreateNFTWrapper />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Marketplace routes with different navbar */}
            <Route path="/marketplace" element={<MarketplaceLayout />}>
              <Route index element={<Marketplace />} />
              <Route path=":collectionId" element={<Marketplace />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NFTProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;






