import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define common theme settings
const commonThemeSettings = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '20px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '18px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '16px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '16px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 'normal',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '12px',
      fontWeight: 'normal',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 500,
      fontSize: '14px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8, // 8px base unit for grid system
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
          '&:focus': {
            outline: '2px solid #1E40AF',
            outlineOffset: '2px',
          },
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'box-shadow 0.2s ease-in-out',
        },
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24, // 24px card padding
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1E40AF',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1E40AF',
                borderWidth: '2px',
                boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
              },
            },
            '&.Mui-error': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#DC2626',
                borderWidth: '2px',
                animation: 'shake 0.5s ease-in-out',
              },
            },
            // Edit mode styling
            '&.edit-mode': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1E40AF',
                borderWidth: '2px',
                boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
              },
            },
            // Modified data indicator
            '&.modified': {
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EA580C',
                zIndex: 1,
              },
            },
            // Validated data indicator
            '&.validated': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#059669',
              },
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
          padding: '6px 12px',
        },
      },
    },
  },
};

// Light theme with new design system
const lightThemeOptions: ThemeOptions = {
  ...commonThemeSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#1E40AF', // Deep Blue - Professional, trustworthy
      light: '#3B82F6',
      dark: '#1E3A8A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#059669', // Teal - Success, money-related
      light: '#10B981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626', // Red - Error states
      light: '#EF4444',
      dark: '#B91C1C',
    },
    warning: {
      main: '#EA580C', // Orange - Attention, warnings
      light: '#F97316',
      dark: '#C2410C',
    },
    info: {
      main: '#0EA5E9', // Light Blue
      light: '#38BDF8',
      dark: '#0284C7',
    },
    success: {
      main: '#059669', // Teal - Success states
      light: '#10B981',
      dark: '#047857',
    },
    background: {
      default: '#F8FAFC', // Neutral gray scale
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Slate 800
      secondary: '#64748b', // Slate 500
      disabled: '#94a3b8', // Slate 400
    },
    divider: '#e2e8f0', // Slate 200
  },
};

// Dark theme
const darkThemeOptions: ThemeOptions = {
  ...commonThemeSettings,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Blue
      light: '#93c5fd',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a78bfa', // Purple
      light: '#c4b5fd',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f87171', // Red
      light: '#fca5a5',
      dark: '#ef4444',
    },
    warning: {
      main: '#fbbf24', // Amber
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    info: {
      main: '#38bdf8', // Light Blue
      light: '#7dd3fc',
      dark: '#0ea5e9',
    },
    success: {
      main: '#34d399', // Emerald
      light: '#6ee7b7',
      dark: '#10b981',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f1f5f9', // Slate 100
      secondary: '#cbd5e1', // Slate 300
      disabled: '#94a3b8', // Slate 400
    },
    divider: '#334155', // Slate 700
  },
};

// Create themes
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Export theme getter function
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'light' ? lightTheme : darkTheme;
};