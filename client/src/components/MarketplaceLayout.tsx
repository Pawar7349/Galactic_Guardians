
import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketplaceNavbar from './MarketplaceNavbar';

const MarketplaceLayout: React.FC = () => {
  return (
    <>
      <MarketplaceNavbar />
      <Outlet /> 
    </>
  );
};

export default MarketplaceLayout;