import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			/* Design system semantic tokens */
  			brand: {
  				DEFAULT: '#E8612D',
  				hover: '#D4551F',
  				light: '#FFF4EF',
  			},
  			ink: {
  				primary: '#1E293B',
  				secondary: '#64748B',
  				muted: '#94A3B8',
  			},
  			line: {
  				DEFAULT: '#E5E7EB',
  				subtle: '#F0F0F0',
  			},
  			page: '#F8F5F2',
  		},
  		boxShadow: {
  			card: '0 2px 12px rgba(0,0,0,0.06)',
  			'card-lg': '0 4px 20px rgba(0,0,0,0.08)',
  			brand: '0 4px 12px rgba(232,97,45,0.25)',
  			nav: '0 -2px 10px rgba(0,0,0,0.05)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'slide-down': {
  				'0%': { opacity: '0', transform: 'translate(-50%, -20px)' },
  				'100%': { opacity: '1', transform: 'translate(-50%, 0)' },
  			},
  			'slide-up': {
  				'0%': { opacity: '0', transform: 'translateY(20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'bounce-in': {
  				'0%': { opacity: '0', transform: 'scale(0.3)' },
  				'50%': { transform: 'scale(1.05)' },
  				'70%': { transform: 'scale(0.95)' },
  				'100%': { opacity: '1', transform: 'scale(1)' },
  			},
  			'star-pulse': {
  				'0%, 100%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(1.15)' },
  			},
  			'sheet-up': {
  				'0%': { transform: 'translateY(100%)' },
  				'100%': { transform: 'translateY(0)' },
  			},
  		},
  		animation: {
  			'slide-down': 'slide-down 0.3s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'bounce-in': 'bounce-in 0.4s ease-out',
  			'star-pulse': 'star-pulse 0.3s ease-in-out',
  			'sheet-up': 'sheet-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
