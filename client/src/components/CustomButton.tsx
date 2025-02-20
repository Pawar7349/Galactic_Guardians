
import React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

const CustomButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <MuiButton
      sx={{
        background: 'linear-gradient(45deg, #00E5FF 30%, #D500F9 90%)',
        color: 'white',
        padding: '8px 24px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        '&:hover': {
          background: 'linear-gradient(45deg, #00E676 30%, #D500F9 90%)',
        },
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default CustomButton;
