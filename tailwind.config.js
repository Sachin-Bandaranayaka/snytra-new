/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D94E1F', // Warm Earthy Red
        'primary-orange': '#E85D10', // Main orange from mockups
        charcoal: '#333333', // Deep Charcoal
        beige: '#F5F0E6', // Soft Beige
        yellow: '#F5C16C', // Golden Yellow
        olive: '#8D9B6B', // Muted Olive Green
        white: '#FFFFFF', // Pure White
        lightGray: '#E5E5E5', // Light Gray
        darkGray: '#4F4F4F', // Dark Gray
        skyBlue: '#4A90E2', // Sky Blue
        'dashboard-bg': '#F9F5F1', // Dashboard background color from mockups
        // Add restaurant dynamic colors
        'restaurant-primary': 'var(--restaurant-primary-color, #D94E1F)',
        'restaurant-primary-light': 'var(--restaurant-primary-color-light, #e16c47)',
        'restaurant-primary-dark': 'var(--restaurant-primary-color-dark, #c2461b)',
        'restaurant-secondary': 'var(--restaurant-secondary-color, #8D9B6B)',
        'restaurant-secondary-light': 'var(--restaurant-secondary-color-light, #a5b087)',
        'restaurant-secondary-dark': 'var(--restaurant-secondary-color-dark, #798557)',
      },
      backgroundColor: {
        'orange-gradient-start': '#FFB380',
        'orange-gradient-end': '#E85D10',
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '1rem',
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: '#333333',
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1rem',
              marginBottom: '1rem'
            },
            th: {
              backgroundColor: '#f9f9f9',
              border: '1px solid #e5e5e5',
              padding: '0.5rem',
              fontWeight: '600'
            },
            td: {
              border: '1px solid #e5e5e5',
              padding: '0.5rem'
            },
            'ul > li': {
              position: 'relative',
              paddingLeft: '1.75em'
            },
            'ul > li::before': {
              position: 'absolute',
              left: '0',
              content: '"•"',
              color: '#D94E1F'
            },
            'ol > li': {
              position: 'relative',
              paddingLeft: '1.75em'
            }
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
} 