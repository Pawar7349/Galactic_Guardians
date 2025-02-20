// theme.ts

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    primary: {
      main: '#00E5FF', // Neon blue
    },
    secondary: {
      main: '#D500F9', // Neon purple
    },
    info: {
      main: '#00E676', // Neon green
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
  },
  typography: {
    fontFamily: 'Orbitron, sans-serif',
    h1: {
      fontFamily: 'Exo, sans-serif',
    },
    h2: {
      fontFamily: 'Exo, sans-serif',
    },
    h3: {
      fontFamily: 'Exo, sans-serif',
    },
    h4: {
      fontFamily: 'Orbitron, sans-serif',
    },
    h5: {
      fontFamily: 'Orbitron, sans-serif',
    },
    h6: {
      fontFamily: 'Orbitron, sans-serif',
    },
    body1: {
      fontFamily: 'Exo, sans-serif',
    },
    body2: {
      fontFamily: 'Exo, sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0 3px 5px 2px rgba(0, 229, 255, .3)',
        },
      },
    },
  },
});

export default theme;
