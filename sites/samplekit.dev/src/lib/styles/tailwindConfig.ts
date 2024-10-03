import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { componentPaths, utilityPaths } from './postcss/cssAsPlugin';
import { THEMES } from './themeUtils';
import type { Config } from 'tailwindcss';
import type { PluginCreator } from 'tailwindcss/types/config';

const createAllColors = () => {
	// light/dark/adaptive with 1-12 + 9-contrast (25 tokens, 37 vars)
	const token = ['green', 'red', 'amber', 'blue', 'iris'] as const;
	// light/dark/adaptive with 1-12 + 1-12 alpha (48 tokens, 72 vars)
	const tokenGray = ['mauve', 'sand'] as const;
	// adaptive with 1-12 + 9-contrast (0 tokens, 13 vars)
	const semantic = ['success', 'error', 'warning', 'info', 'accent'] as const;
	// adaptive with 1-12 + 1-12 alpha (0 tokens, 24 vars)
	const semanticGray = ['gray'] as const;

	const res: Record<string, string | Record<string, string | Record<string, string>>> = {
		transparent: 'transparent',
		black: 'hsl(var(--black) / <alpha-value>)',
		white: 'hsl(var(--white) / <alpha-value>)',
		logo: 'hsl(var(--logo) / <alpha-value>)',
		'sun-moon': 'hsl(var(--sun-moon) / <alpha-value>)',
		svelte: 'hsl(var(--svelte) / <alpha-value>)',
	};

	res['app'] = {
		bg: 'hsl(var(--app-bg) / <alpha-value>)',
	};

	for (const theme of THEMES) {
		res['app'][`bg-${theme.name}`] = `hsl(var(--app-bg-${theme.name}) / <alpha-value>)`;
	}

	for (const t of token) {
		const outer: Record<string, Record<string, string>> = {};
		for (const i of Array(12).keys()) {
			const inner: Record<string, string> = {
				DEFAULT: `hsl(var(--${t}-${i + 1}) / <alpha-value>)`,
				light: `hsl(var(--${t}-${i + 1}-light) / <alpha-value>)`,
				dark: `hsl(var(--${t}-${i + 1}-dark) / <alpha-value>)`,
			};
			if (i === 8) inner['contrast'] = `hsl(var(--${t}-${i + 1}-contrast) / <alpha-value>)`;
			outer[`${i + 1}`] = inner;
		}
		res[t] = outer;
	}

	for (const t of tokenGray) {
		const outer: Record<string, Record<string, string>> = {};
		for (const i of Array(12).keys()) {
			const inner: Record<string, string> = {
				DEFAULT: `hsl(var(--${t}-${i + 1}) / <alpha-value>)`,
				light: `hsl(var(--${t}-${i + 1}-light) / <alpha-value>)`,
				dark: `hsl(var(--${t}-${i + 1}-dark) / <alpha-value>)`,
			};
			const alpha: Record<string, string> = {
				DEFAULT: `var(--${t}-a${i + 1})`,
				light: `var(--${t}-a${i + 1}-light)`,
				dark: `var(--${t}-a${i + 1}-dark)`,
			};
			outer[`${i + 1}`] = inner;
			outer[`a${i + 1}`] = alpha;
		}
		res[t] = outer;
	}

	for (const t of semantic) {
		const outer: Record<string, string | Record<string, string>> = {};
		for (const i of Array(12).keys()) {
			if (i === 8) {
				outer[`${i + 1}`] = {
					DEFAULT: `hsl(var(--${t}-${i + 1}) / <alpha-value>)`,
					contrast: `hsl(var(--${t}-${i + 1}-contrast) / <alpha-value>)`,
				};
			} else {
				outer[`${i + 1}`] = `hsl(var(--${t}-${i + 1}) / <alpha-value>)`;
			}
		}
		res[t] = outer;
	}

	for (const t of semanticGray) {
		const outer: Record<string, string> = {};
		for (const i of Array(12).keys()) {
			outer[`${i + 1}`] = `hsl(var(--${t}-${i + 1}) / <alpha-value>)`;
			outer[`a${i + 1}`] = `var(--${t}-a${i + 1})`;
		}
		res[t] = outer;
	}
	return res;
};

export const config = {
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
		colors: createAllColors(),
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
			height: {
				nav: 'var(--open-nav-height)',
				'screen-nav': 'calc(100vh - 3.5rem)',
			},
			minHeight: {
				'screen-nav': 'calc(100vh - 3.5rem)',
			},
			margin: {
				'5-12': 'clamp(1.25rem, -1.6667rem + 7.2917vw, 3rem)',
				'6-9': 'clamp(1.5rem, 0.25rem + 3.125vw, 2.25rem)',
			},
			padding: {
				nav: 'var(--open-nav-height)',
				page: 'clamp(1rem, -2.3333rem + 8.3333vw, 3rem)',
			},

			// breakpoints
			screens: {
				xs: '440px',
			},

			// typography
			fontSize: {
				h1: 'clamp(3rem, 1.3333rem + 4.1667vw, 4rem)',
				'h1-min': '3rem',
				'h1-max': '4rem',
				h2: 'clamp(2rem, -0.083300rem + 5.2083vw, 3.25rem)',
				'h2-min': '2rem',
				'h2-max': '3.25rem',
				h3: 'clamp(1.4rem, 0.40000rem + 2.5000vw, 2rem)',
				'h3-min': '1.4rem',
				'h3-max': '2rem',
				h4: 'clamp(1.25rem, 0.83333rem + 1.0417vw, 1.5rem)',
				'h4-min': '1.25rem',
				'h4-max': '1.5rem',
				h5: '1.125rem',
				body: '1rem',
				'body-sm': '0.875rem',
				caption: '.875rem',
				'caption-sm': '.75rem',
				'sm-base': 'clamp(0.875rem, 0.6667rem + 0.5208vw, 1rem)',
				'base-lg': 'clamp(1rem, 0.7917rem + 0.5208vw, 1.125rem)',
				'lg-2xl': 'clamp(1.125rem, 0.5rem + 1.5625vw, 1.5rem)',
			},
			lineHeight: {
				h1: 'clamp(3.75rem, 1.4580rem + 5.7300vw, 5.1252rem)',
				'h1-min': '3.75rem',
				'h1-max': '5.1252rem',
				h2: 'clamp(2.5626rem, 0.16690rem + 5.9892vw, 4rem)',
				'h2-min': '2.5626rem',
				'h2-max': '4rem',
				h3: 'clamp(2.1rem, 1.3290rem + 1.9275vw, 2.5626rem)',
				'h3-min': '2.1rem',
				'h3-max': '2.5626rem',
				h4: 'clamp(1.5rem, 0.77000rem + 1.8250vw, 1.938rem)',
				'h4-min': '1.5rem',
				'h4-max': '1.938rem',
				h5: '1.6875rem',
				body: '1.5rem',
				caption: '1.4rem',
				'sm-base': 'clamp(1.25rem, 0.8333rem + 1.0417vw, 1.5rem)',
				'base-lg': 'clamp(1.5rem, 1.0833rem + 1.0417vw, 1.75rem)',
				'lg-2xl': 'clamp(1.75rem, 1.3333rem + 1.0417vw, 2rem)',
			},
			fontFamily: {
				sans: ['Nunito'],
				serif: ['Alegreya'],
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
							pre: {
								color: false,
								backgroundColor: false,
							},
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
							h1: {
								color: 'var(--tw-prose-headings)',
								fontFamily: theme('fontFamily.serif'),
								fontWeight: '800',
							},
							h2: {
								color: 'var(--tw-prose-headings)',
								fontFamily: theme('fontFamily.serif'),
								fontWeight: '700',
							},
							h3: {
								color: 'var(--tw-prose-headings)',
								fontFamily: theme('fontFamily.serif'),
								fontWeight: '600',
							},
							h4: {
								fontWeight: '600',
							},
						},
					},
				};
			},
		},
	},
	plugins: [
		({ addUtilities }) => {
			addUtilities({
				'.page': {
					'@apply p-page mx-auto max-w-7xl h-full w-full flex-1': {},
				},
				'.full': {
					'@apply h-full w-full flex-1': {},
				},
				'.min-aspect-video': {
					"@apply before:float-left before:pb-[56.25%] before:content-[''] after:clear-both after:table after:content-['']":
						{},
				},
			});
		},
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
		containerQueries,
		forms({ strategy: 'class' }),
		typography(),
	] satisfies PluginCreator[],
} satisfies Config;
