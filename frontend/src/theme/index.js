import { createTheme, alpha } from '@mui/material/styles';

export const getCustomTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#ffa116', // LeetCode Signature Orange
        light: '#ffc266',
        dark: '#e68a00',
        contrastText: '#1a1a1a',
      },
      secondary: {
        main: '#00b8a3', // LeetCode Teal / Easy Green
        light: '#26d07c',
        dark: '#008e7e',
        contrastText: '#ffffff',
      },
      success: {
        main: '#00b8a3',
        light: '#26d07c',
        dark: '#008e7e',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#ffc01e',
        light: '#ffd154',
        dark: '#d99e00',
        contrastText: '#1a1a1a',
      },
      error: {
        main: '#ff375f',
        light: '#ff6685',
        dark: '#cc1139',
        contrastText: '#ffffff',
      },
      info: {
        main: '#3ea6ff',
        light: '#7cc4ff',
        dark: '#1a7fd1',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#141414' : '#f5f6f8',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#eff1f6' : '#1f1f1f',
        secondary: isDark ? '#9ea0a5' : '#6b6f76',
        disabled: isDark ? '#5c5c5c' : '#c2c2c2',
      },
      divider: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08),
      action: {
        hover: isDark ? alpha('#ffa116', 0.08) : alpha('#ffa116', 0.06),
        selected: isDark ? alpha('#ffa116', 0.16) : alpha('#ffa116', 0.12),
      },
    },

    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15 },
      h2: { fontWeight: 800, letterSpacing: '-0.75px', lineHeight: 1.2 },
      h3: { fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.25 },
      h4: { fontWeight: 700, letterSpacing: '-0.4px' },
      h5: { fontWeight: 600, letterSpacing: '-0.2px' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500, color: isDark ? '#9ea0a5' : '#6b6f76' },
      subtitle2: { fontWeight: 500, color: isDark ? '#9ea0a5' : '#6b6f76' },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.2px' },
      overline: { fontWeight: 700, letterSpacing: '1.2px' },
    },

    shape: {
      borderRadius: 10,
    },

    shadows: isDark
      ? [
          'none',
          '0 1px 2px rgba(0,0,0,0.4)',
          '0 2px 6px rgba(0,0,0,0.4)',
          '0 4px 10px rgba(0,0,0,0.45)',
          '0 6px 16px rgba(0,0,0,0.45)',
          '0 8px 20px rgba(0,0,0,0.5)',
          ...Array(19).fill('0 12px 32px rgba(0,0,0,0.55)'),
        ]
      : [
          'none',
          '0 1px 2px rgba(20,20,20,0.06)',
          '0 2px 6px rgba(20,20,20,0.07)',
          '0 4px 10px rgba(20,20,20,0.08)',
          '0 6px 16px rgba(20,20,20,0.09)',
          '0 8px 20px rgba(20,20,20,0.1)',
          ...Array(19).fill('0 12px 32px rgba(20,20,20,0.12)'),
        ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#3e3e3e transparent' : '#d0d0d0 transparent',
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-thumb': {
            background: isDark ? '#3e3e3e' : '#d0d0d0',
            borderRadius: 8,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: isDark ? '#4d4d4d' : '#b5b5b5',
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            boxShadow: 'none',
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark
                ? '0 6px 16px rgba(255, 161, 22, 0.25)'
                : '0 6px 16px rgba(255, 161, 22, 0.2)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          contained: {
            backgroundImage: 'linear-gradient(135deg, #ffa116 0%, #ff8c00 100%)',
            '&:hover': {
              backgroundImage: 'linear-gradient(135deg, #ffb84d 0%, #ffa116 100%)',
              boxShadow: '0 6px 20px rgba(255, 161, 22, 0.35)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': { borderWidth: '1.5px' },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            backgroundImage: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
              : 'none',
            border: `1px solid ${isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06)}`,
            boxShadow: isDark
              ? '0 8px 24px rgba(0,0,0,0.35)'
              : '0 4px 16px rgba(20,20,20,0.06)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06)}`,
          },
          elevation1: {
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.35)' : '0 2px 8px rgba(20,20,20,0.06)',
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha('#1a1a1a', 0.8) : alpha('#ffffff', 0.85),
            backdropFilter: 'blur(12px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.06)}`,
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#181818' : '#fafafa',
            '& .MuiTableCell-head': {
              color: isDark ? '#9ea0a5' : '#6b6f76',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s ease',
            '&:hover': {
              backgroundColor: isDark ? alpha('#ffa116', 0.05) : alpha('#ffa116', 0.04),
            },
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.05)}`,
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
          filled: {
            backgroundColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.06),
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#3a3a3a' : '#1f1f1f',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 6,
            padding: '6px 10px',
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined' },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'box-shadow 0.15s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? alpha('#ffa116', 0.5) : alpha('#ffa116', 0.6),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha('#ffa116', isDark ? 0.2 : 0.15)}`,
            },
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: '#ffa116',
              '& + .MuiSwitch-track': {
                backgroundColor: '#ffa116',
                opacity: 0.5,
              },
            },
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08),
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            height: 6,
            backgroundColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.06),
          },
          bar: {
            borderRadius: 8,
            backgroundImage: 'linear-gradient(90deg, #ffa116 0%, #00b8a3 100%)',
          },
        },
      },
    },
  });
};