/** @type {import('tailwindcss').Config} */
const { nextui } = require('@nextui-org/react')

// Import our design tokens for Tailwind integration
const designTokens = {
  colors: {
    // Healthcare status colors for Tailwind utilities
    medical: {
      success: '#2E7D32',
      warning: '#FF8F00',
      critical: '#C62828',
      info: '#1976D2',
    },
    compliance: {
      phi: '#7B1FA2',
      encrypted: '#388E3C',
      audit: '#5D4037',
      consent: '#1565C0',
      restricted: '#D32F2F',
    },
    interactive: {
      primary: '#1976D2',
      secondary: '#424242',
      accent: '#7B1FA2',
    },
  },
  spacing: {
    // 8px grid system
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
  },
  fontFamily: {
    primary: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    monospace: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
  },
}

// NextUI themes are defined inline below to avoid TypeScript import issues

module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Healthcare-specific colors integrated with design tokens
        ...designTokens.colors,

        // Keep existing shadcn/ui CSS variable colors for compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      spacing: {
        // Integrate design token spacing with Tailwind defaults
        ...designTokens.spacing,
      },
      borderRadius: {
        // Integrate design token border radius
        ...designTokens.borderRadius,
        // Keep CSS variable compatibility
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        // Integrate design token font families
        sans: designTokens.fontFamily.primary,
        mono: designTokens.fontFamily.monospace,
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        // Healthcare-specific animations
        pulseHealthcare: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)'
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)'
          },
        },
        emergencyPulse: {
          '0%, 100%': {
            backgroundColor: 'rgb(198, 40, 40)',
            boxShadow: '0 0 0 0 rgba(198, 40, 40, 0.7)'
          },
          '50%': {
            backgroundColor: 'rgb(211, 47, 47)',
            boxShadow: '0 0 0 10px rgba(198, 40, 40, 0)'
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        'pulse-healthcare': 'pulseHealthcare 2s infinite',
        'emergency-pulse': 'emergencyPulse 1.5s infinite',
      },
      // Healthcare-specific utilities
      minHeight: {
        'touch-target': '44px', // WCAG AAA touch target
      },
      minWidth: {
        'touch-target': '44px', // WCAG AAA touch target
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    nextui({
      themes: {
        'healthcare-light': {
          extend: 'light',
          colors: {
            // Background and surfaces
            background: '#F8F9FA',
            foreground: '#212121',
            content1: '#FFFFFF',
            content2: '#F8F9FA',
            content3: '#F5F5F5',
            content4: '#FAFAFA',

            // Focus and overlay
            focus: '#1976D2',
            overlay: 'rgba(0, 0, 0, 0.6)',
            divider: '#E0E0E0',

            // Primary color scale (Healthcare professional blue)
            primary: {
              50: '#e3f2fd',
              100: '#bbdefb',
              200: '#90caf9',
              300: '#64b5f6',
              400: '#42a5f5',
              500: '#1976D2',
              600: '#1565c0',
              700: '#0d47a1',
              800: '#0a3d91',
              900: '#063281',
              DEFAULT: '#1976D2',
              foreground: '#ffffff',
            },

            // Success color scale
            success: {
              50: '#e8f5e8',
              100: '#c8e6c9',
              200: '#a5d6a7',
              300: '#81c784',
              400: '#66bb6a',
              500: '#2E7D32',
              600: '#2e7d32',
              700: '#2c6b2f',
              800: '#1b5e20',
              900: '#1b5e20',
              DEFAULT: '#2E7D32',
              foreground: '#ffffff',
            },

            // Warning color scale
            warning: {
              50: '#fff8e1',
              100: '#ffecb3',
              200: '#ffe082',
              300: '#ffd54f',
              400: '#ffca28',
              500: '#FF8F00',
              600: '#ff8f00',
              700: '#ff6f00',
              800: '#e65100',
              900: '#bf360c',
              DEFAULT: '#FF8F00',
              foreground: '#000000',
            },

            // Danger color scale
            danger: {
              50: '#ffebee',
              100: '#ffcdd2',
              200: '#ef9a9a',
              300: '#e57373',
              400: '#ef5350',
              500: '#C62828',
              600: '#c62828',
              700: '#b71c1c',
              800: '#a91b1b',
              900: '#8e1919',
              DEFAULT: '#C62828',
              foreground: '#ffffff',
            },

            // Secondary color scale
            secondary: {
              50: '#f8f9fa',
              100: '#f1f3f4',
              200: '#e8eaed',
              300: '#dadce0',
              400: '#bdc1c6',
              500: '#424242',
              600: '#373737',
              700: '#2d2d2d',
              800: '#242424',
              900: '#1a1a1a',
              DEFAULT: '#424242',
              foreground: '#ffffff',
            },

            // Default color scale
            default: {
              50: '#fafafa',
              100: '#f5f5f5',
              200: '#eeeeee',
              300: '#e0e0e0',
              400: '#bdbdbd',
              500: '#9e9e9e',
              600: '#757575',
              700: '#616161',
              800: '#424242',
              900: '#212121',
              DEFAULT: '#f4f4f5',
              foreground: '#212121',
            },
          },
        },
        'healthcare-dark': {
          extend: 'dark',
          colors: {
            // Background and surfaces
            background: '#121212',
            foreground: '#FFFFFF',
            content1: '#1E1E1E',
            content2: '#2D2D2D',
            content3: '#424242',
            content4: '#1A1A1A',

            // Focus and overlay
            focus: '#90CAF9',
            overlay: 'rgba(0, 0, 0, 0.8)',
            divider: '#424242',

            // Primary color scale (Light blue for dark mode)
            primary: {
              50: '#063281',
              100: '#0a3d91',
              200: '#0d47a1',
              300: '#1565c0',
              400: '#1976d2',
              500: '#90CAF9',
              600: '#64b5f6',
              700: '#42a5f5',
              800: '#2196f3',
              900: '#0d8bf2',
              DEFAULT: '#90CAF9',
              foreground: '#121212',
            },

            // Success color scale
            success: {
              50: '#1b5e20',
              100: '#2c6b2f',
              200: '#2e7d32',
              300: '#388e3c',
              400: '#4caf50',
              500: '#A5D6A7',
              600: '#81c784',
              700: '#66bb6a',
              800: '#4caf50',
              900: '#2e7d32',
              DEFAULT: '#A5D6A7',
              foreground: '#121212',
            },

            // Warning color scale
            warning: {
              50: '#bf360c',
              100: '#e65100',
              200: '#ff6f00',
              300: '#ff8f00',
              400: '#ffa000',
              500: '#ffb300',
              600: '#ffc107',
              700: '#ffd54f',
              800: '#ffe082',
              900: '#ffecb3',
              DEFAULT: '#fbbf24',
              foreground: '#121212',
            },

            // Danger color scale
            danger: {
              50: '#8e1919',
              100: '#a91b1b',
              200: '#b71c1c',
              300: '#c62828',
              400: '#d32f2f',
              500: '#F48FB1',
              600: '#f06292',
              700: '#ec407a',
              800: '#e91e63',
              900: '#c2185b',
              DEFAULT: '#F48FB1',
              foreground: '#121212',
            },

            // Secondary color scale
            secondary: {
              50: '#1a1a1a',
              100: '#242424',
              200: '#2d2d2d',
              300: '#373737',
              400: '#424242',
              500: '#616161',
              600: '#757575',
              700: '#9e9e9e',
              800: '#bdbdbd',
              900: '#e0e0e0',
              DEFAULT: '#3f3f46',
              foreground: '#FFFFFF',
            },

            // Default color scale
            default: {
              50: '#212121',
              100: '#424242',
              200: '#616161',
              300: '#757575',
              400: '#9e9e9e',
              500: '#bdbdbd',
              600: '#e0e0e0',
              700: '#eeeeee',
              800: '#f5f5f5',
              900: '#fafafa',
              DEFAULT: '#27272a',
              foreground: '#FFFFFF',
            },
          },
        },
        'quebec-professional': {
          extend: 'light',
          colors: {
            // Quebec-inspired professional theme
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
              DEFAULT: '#0ea5e9',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              DEFAULT: '#64748b',
              foreground: '#ffffff',
            },
          },
        },
        'emergency': {
          extend: 'light',
          colors: {
            // High contrast emergency theme
            primary: {
              50: '#fff1f2',
              100: '#ffe4e6',
              200: '#fecdd3',
              300: '#fda4af',
              400: '#fb7185',
              500: '#C62828',
              600: '#c62828',
              700: '#b91c1c',
              800: '#991b1b',
              900: '#7f1d1d',
              DEFAULT: '#C62828',
              foreground: '#ffffff',
            },
            warning: {
              50: '#fffbeb',
              100: '#fef3c7',
              200: '#fde68a',
              300: '#fcd34d',
              400: '#fbbf24',
              500: '#f59e0b',
              600: '#d97706',
              700: '#b45309',
              800: '#92400e',
              900: '#78350f',
              DEFAULT: '#f59e0b',
              foreground: '#000000',
            },
          },
        },
      },
    }),
  ],
}