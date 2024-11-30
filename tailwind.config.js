/* eslint-disable no-mixed-spaces-and-tabs */
/** @type {import('tailwindcss').Config} */

import TailwindScrollbarHide from 'tailwind-scrollbar-hide'

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				raleway: ['Raleway', 'sans-serif']
			},
			colors: {
				white: '#FFFFFF',
				backgroundGrey: '#F8F8F8',
				lightGray: '#E0E0E0',
				grey: '#707070',
				darkGrey: '#545454',
				black: '#000000',
				redError: '#ff0000',
				red: '#F43535',
				orange: '#FF7600',
				darkOrange: '#FC8621',
				yellow: '#FFE53C',
				lightYellow: '#fff4af',
				backgroundMarine: '#001228',
				marine: '#0B2747',
				pink: '#DA005A',
				green: '#37D6B5',
				lightGreen: '#8cc408',
				darkGreen: '#0f9b2c',
				green2: '#0F9B2C',
				green3: '#19982B',
				gray2: '#A6A6A6',
				purple: '#8A2BE2',
				blueGeo: '#4D8CCB',
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		},
		screens: {
			sm: '768px',
			md: '1200px',
			lg: '1400px',
			xl: '1565px'
		},
		keyframes: {
			rotate: {
				from: {
					transform: 'rotate(0deg)'
				},
				to: {
					transform: 'rotate(360deg)'
				}
			}
		},
		animation: {
			rotate: 'rotate 60s linear infinite',
			rotate30: 'rotate 30s linear infinite',
			rotate15: 'rotate 15s linear infinite',
			rotate5: 'rotate 5s linear infinite'
		},
		backgroundImage: {
			'custom-gradient': 'linear-gradient(to right, #37D6B5, #8cc408, #8CC408, #FFE53C, #FF7600, #DA005A)',
			'right-gradient': 'linear-gradient(to right, #FFFFFF, #FFFFFF, #0F9B2C, #0F9B2C)'
		}
	},
	plugins: [
		TailwindScrollbarHide,
		// eslint-disable-next-line no-undef
		require("tailwindcss-animate")
	],
}

