import { createTheme } from '@mui/material/styles';

export const getCustomTheme = (mode = 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#ffa116', // LeetCode Signature Orange
        light: '#ffb84d',
        dark: '#e68a00',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#00b8a3', // LeetCode Teal / Easy Green
        light: '#26d07c',
        dark: '#008e7e',
        contrastText: '#ffffff',
      },
      success: {
        main: '#00b8a3', // LeetCode Easy
        light: '#26d07c',
        dark: '#008e7e',
      },
      warning: {
        main: '#ffc01e', // LeetCode Medium
        light: '#ffd154',
        dark: '#d99e00',
      },
      error: {
        main: '#ff375f', // LeetCode Hard
        light: '#ff6685',
        dark: '#cc1139',
      },
      background: {
        default: mode === 'dark' ? '#1a1a1a' : '#f7f8fa',
        paper: mode === 'dark' ? '#282828' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#eff1f6' : '#262626',
        secondary: mode === 'dark' ? '#9ea0a5' : '#737373',
      },
      divider: mode === 'dark' ? '#3e3e3e' : '#e5e5e5',
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontWeight: 700, letterSpacing: '-0.5px' },
      h2: { fontWeight: 700, letterSpacing: '-0.5px' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '7px 16px',
            boxShadow: 'none',
            fontWeight: 600,
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: mode === 'dark' ? '#282828' : '#ffffff',
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid #3e3e3e' : '1px solid #e5e5e5',
            boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#282828' : '#ffffff',
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid #3e3e3e' : '1px solid #e5e5e5',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fafafa',
            '& .MuiTableCell-head': {
              color: mode === 'dark' ? '#9ea0a5' : '#737373',
              fontWeight: 600,
              fontSize: '0.825rem',
              borderBottom: mode === 'dark' ? '1px solid #3e3e3e' : '1px solid #e5e5e5',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: mode === 'dark' ? '1px solid #333333' : '1px solid #f0f0f0',
            fontSize: '0.875rem',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
    },
  });
