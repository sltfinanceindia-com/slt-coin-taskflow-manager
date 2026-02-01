import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			/* Responsive Typography Scale */
			fontSize: {
				// Mobile-first sizes with responsive scaling
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],    // 10px
				'xs': ['0.75rem', { lineHeight: '1rem' }],          // 12px
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],      // 14px
				'base': ['1rem', { lineHeight: '1.5rem' }],         // 16px
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],      // 18px
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],       // 20px
				'2xl': ['1.5rem', { lineHeight: '2rem' }],          // 24px
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],     // 30px
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],       // 36px
				'5xl': ['3rem', { lineHeight: '1' }],               // 48px
				// Fluid typography with clamp
				'fluid-sm': ['clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)', { lineHeight: '1.4' }],
				'fluid-base': ['clamp(0.875rem, 0.8rem + 0.25vw, 1rem)', { lineHeight: '1.5' }],
				'fluid-lg': ['clamp(1rem, 0.9rem + 0.4vw, 1.125rem)', { lineHeight: '1.6' }],
				'fluid-xl': ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.5' }],
				'fluid-2xl': ['clamp(1.25rem, 1rem + 0.9vw, 1.75rem)', { lineHeight: '1.3' }],
				'fluid-3xl': ['clamp(1.5rem, 1.1rem + 1.4vw, 2.25rem)', { lineHeight: '1.2' }],
				'fluid-4xl': ['clamp(1.875rem, 1.4rem + 1.6vw, 2.75rem)', { lineHeight: '1.15' }],
				// Table-specific sizes
				'table-header': ['clamp(0.75rem, 0.7rem + 0.15vw, 0.875rem)', { lineHeight: '1.4', fontWeight: '600' }],
				'table-cell': ['clamp(0.8125rem, 0.75rem + 0.2vw, 0.9375rem)', { lineHeight: '1.4' }],
				// Sidebar-specific sizes
				'sidebar': ['clamp(0.8125rem, 0.78rem + 0.15vw, 0.9375rem)', { lineHeight: '1.4' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				'coin-gold': {
					DEFAULT: 'hsl(var(--coin-gold))',
					foreground: 'hsl(var(--coin-gold-foreground))',
					glow: 'hsl(var(--coin-glow))',
					shine: 'hsl(var(--coin-shine))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					glow: 'hsl(var(--success-glow))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-coin': 'var(--gradient-coin)',
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-background': 'var(--gradient-background)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'green': 'var(--shadow-green)',
				'glow': 'var(--shadow-glow)',
				'glass': 'var(--shadow-glass)',
				'card': 'var(--shadow-card)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				},
				'slide-in-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide-out-down': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--coin-glow) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--coin-glow) / 0.6)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'pulse-ring': {
					'0%': { transform: 'scale(0.95)', opacity: '1' },
					'50%': { transform: 'scale(1)', opacity: '0.7' },
					'100%': { transform: 'scale(0.95)', opacity: '1' }
				},
				'count-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-out',
				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-out-down': 'slide-out-down 0.3s ease-out',
				'shimmer': 'shimmer 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
				'count-up': 'count-up 0.6s ease-out',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
			},
			transitionDuration: {
				'2000': '2000ms',
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
