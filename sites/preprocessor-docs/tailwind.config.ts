import typography from '@tailwindcss/typography';
import { THEMES } from './src/lib/styles/colorThemeUtils';
import { componentPaths, utilityPaths } from './src/lib/styles/postcss/cssAsPlugin';
import type { Config } from 'tailwindcss';
import type { PluginCreator } from 'tailwindcss/types/config';

const colors = [
	// design colors
	'green',
	'jade',
	'red',
	'ruby',
	'yellow',
	'amber',
	'blue',
	'cyan',
	'iris',
	'mauve', // grayish
	'sand', // grayish

	// theme colors
	'success',
	'error',
	'warning',
	'info',
	'accent',
	'gray',
] as const;
const grays = ['gray', 'mauve', 'sand'] as const;
type Grayish = (typeof grays)[number];
const isGrayish = (color: string): color is Grayish => ['gray', 'mauve', 'sand'].includes(color);

export default {
	darkMode: ['class'],
	content: ['./src/**/*.{html,svelte,js,ts,svx}'],
	theme: {
		borderRadius: {
			none: '0',
			tab: 'var(--radius-tab)',
			badge: 'var(--radius-badge)',
			btn: 'var(--radius-btn)',
			card: 'var(--radius-card)',
			full: '9999px',
		},
		boxShadow: {
			'1': 'var(--shadow-1)',
			'2': 'var(--shadow-2)',
			'3': 'var(--shadow-3)',
			'4': 'var(--shadow-4)',
			'5': 'var(--shadow-5)',
			'6': 'var(--shadow-6)',
			none: '0 0 #0000',
		},
		boxShadowColor: {},
		colors: (() => {
			const res: Record<string, string | Record<string, string>> = {
				transparent: 'transparent',
				black: 'hsl(0deg 0% 0% / <alpha-value>)',
				white: 'hsl(0deg 0% 100% / <alpha-value>)',
				logo: 'hsl(var(--logo) / <alpha-value>)',
				'sun-moon': `hsl(var(--amber-9))`,
				svelte: `hsl(14.6 100% 50% / <alpha-value>)`,
			};

			res['app'] = {
				bg: 'hsl(var(--app-bg) / <alpha-value>)',
			};

			for (const theme of THEMES) {
				res['app'][`bg-${theme.name}`] = `hsl(var(--app-bg-${theme.name}) / <alpha-value>)`;
			}

			for (const color of colors) {
				const baseColors = [...Array(12).keys()].reduce<Record<string, string>>((acc, i) => {
					return { ...acc, [`${i + 1}`]: `hsl(var(--${color}-${i + 1}) / <alpha-value>)` };
				}, {});
				if (isGrayish(color)) {
					const alphaColors = [...Array(12).keys()].reduce<Record<string, string>>((acc, i) => {
						return { ...acc, [`a${i + 1}`]: `var(--${color}-a${i + 1})` };
					}, {});
					res[color] = { ...baseColors, ...alphaColors };
				} else {
					res[color] = { ...baseColors, '9-contrast': `hsl(var(--${color}-9-contrast) / <alpha-value>)` };
				}
			}
			return res;
		})(),
		extend: {
			// animations
			animation: {
				'fade-in': 'fade-in 0.2s ease-out forwards',
				'fade-up-and-in': 'fade-up-and-in 0.2s ease-out forwards',
				'modal-fade-in': 'modal-fade-in 0.1s ease-out forwards',
				'spin-slow': 'spin 3s linear infinite',
				blink: 'blink 1.4s both infinite',
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-up-and-in': {
					'0%': { opacity: '0', transform: 'translateY(4px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'modal-fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '.7' },
				},
				blink: {
					'0%': { opacity: '0.2' },
					'20%': { opacity: '1' },
					'100% ': { opacity: '0.2' },
				},
			},

			// layout
			padding: {
				page: 'clamp(1rem, -2.3333rem + 8.3333vw, 3rem)',
			},

			// breakpoints
			screens: {
				xs: '440px',
			},

			// typography
			fontFamily: {
				serif: ['KaTeX_Main'],
				mono: ['UbuntuMonoLigaturized'],
			},

			// typography plugin
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			typography: ({ theme }: { theme: any }) => {
				return {
					DEFAULT: {
						css: {
							'code::before': false,
							'code::after': false,
							pre: false,
							code: false,
							'pre code': false,
							a: {
								'@apply no-underline link': '',
							},
							table: {
								'@apply text-left': '',
							},
						},
					},
					radix: {
						css: {
							'--tw-prose-body': theme('colors.gray[11]').replace(' / <alpha-value>', ''),
							'--tw-prose-headings': theme('colors.gray[12]').replace(' / <alpha-value>', ''),
							'--tw-prose-lead': theme('colors.gray[12]').replace(' / <alpha-value>', ''),
							'--tw-prose-links': theme('colors.accent[12]').replace(' / <alpha-value>', ''),
							'--tw-prose-bold': theme('colors.gray[11]').replace(' / <alpha-value>', ''),
							'--tw-prose-counters': theme('colors.accent[12]').replace(' / <alpha-value>', ''),
							'--tw-prose-bullets': theme('colors.accent[12]').replace(' / <alpha-value>', ''),
							'--tw-prose-hr': theme('colors.gray[5]').replace(' / <alpha-value>', ''),
							'--tw-prose-quotes': theme('colors.gray[8]').replace(' / <alpha-value>', ''),
							'--tw-prose-quote-borders': theme('colors.gray[5]').replace(' / <alpha-value>', ''),
							'--tw-prose-captions': theme('colors.gray[7]').replace(' / <alpha-value>', ''),
							'--tw-prose-kbd': theme('colors.gray[11]').replace(' / <alpha-value>', ''),
							'--tw-prose-kbd-shadows': theme('colors.gray[5]').replace(' / <alpha-value>', ''),
							'--tw-prose-th-borders': theme('colors.gray[5]').replace(' / <alpha-value>', ''),
							'--tw-prose-td-borders': theme('colors.gray[3]').replace(' / <alpha-value>', ''),
							th: {
								color: theme('colors.gray[12]').replace(' / <alpha-value>', ''),
							},
						},
					},
				};
			},
		},
	},
	plugins: [
		({ addVariant }) => {
			// Note when nesting .light and .dark:
			// .light .dark .light.dark:text-bold will still be bold because dark: only checks if any of the ancestors are .dark
			// Theme colors will correctly apply .light colors, however
			// Similarly, data-theme="amethyst" data-theme="bellflower" will apply bellflower colors, but using iris:text-bold will still be bold
			// prose has an escape: not-prose, but you cannot nest another prose within it
			for (const theme of THEMES) {
				addVariant(theme.name, `:is([data-theme="${theme.name}"]) &`);
			}
			addVariant('light', `.light &`);
			addVariant('invalid-shown', '&:invalid&:data-interacted');
			addVariant('progress-unfilled', ['&::-webkit-progress-bar', '&']);
			addVariant('progress-filled', ['&::-webkit-progress-value', '&::-moz-progress-bar', '&']);
		},
		({ matchUtilities, theme }) => {
			matchUtilities(
				{ 'animation-delay': (value) => ({ 'animation-delay': value }) },
				{ values: theme('transitionDelay') },
			);
			matchUtilities(
				{ 'animation-duration': (value) => ({ 'animation-duration': value }) },
				{ values: theme('transitionDuration') },
			);
		},
		...componentPaths.map(require),
		...utilityPaths.map(require),
		typography(),
	] satisfies PluginCreator[],
} satisfies Config;
