/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'rubik': ['Rubik', 'sans-serif'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        // Matte Futuristic Dark Theme Colors
        'primary-bg': '#121212',     // Main dark coal black background
        'secondary-bg': '#1a1a1a',   // Slightly lighter for cards
        'accent-bg': '#222222',      // Accent backgrounds
        'card-bg': 'rgba(26, 26, 26, 0.8)', // Semi-transparent cards
        
        // Text Colors - kept matte, no shine
        'text-primary': '#f5f5f5',   // Soft white for primary text
        'text-secondary': '#d1d5db', // Light gray for secondary text
        'text-muted': '#9ca3af',     // Muted gray for less important text
        
        // Brand Colors - Matte finish
        'brand-primary': '#00FFFF',   // Matte neon cyan (your specified color)
        'brand-secondary': '#993399', // Matte dusty purple (your specified color)
        'brand-accent': '#00CCCC',    // Slightly darker cyan for accents
        'success': '#10b981',         // Matte green
        'warning': '#f59e0b',         // Matte amber
        'error': '#ef4444',           // Matte red
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 255, 0.2)',      // Matte cyan glow
        'neon-purple': '0 0 20px rgba(153, 51, 153, 0.2)', // Matte purple glow
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',          // Deeper shadows for contrast
        'geometric': '0 0 30px rgba(0, 255, 255, 0.1)',   // Subtle geometric shadow
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 3s ease infinite'
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }, // Matte cyan glow
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' },       // Subtle matte glow peak
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseGlow: {
          '0%': { opacity: '0.6' },
          '100%': { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animationDelay: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
        '4000': '4000ms',
        '6000': '6000ms'
      },
      backgroundImage: {
        'gradient-gaming': 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)', // Updated to new matte theme
        'gradient-card': 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)', // Matte card gradient
        'gradient-brand': 'linear-gradient(135deg, #00FFFF 0%, #993399 100%)', // Your specified colors
        'gradient-brand-secondary': 'linear-gradient(135deg, #993399 0%, #00CCCC 100%)', // Purple to cyan
        'gradient-futuristic': 'linear-gradient(135deg, #121212 0%, #222222 50%, #1a1a1a 100%)', // Multi-stop futuristic
      },
    },
  },
  plugins: [],
}
