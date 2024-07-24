// this is imported into tailwind.config.ts so don't use $lib alias
import { setBrowserCookie, getBrowserCookie } from '../utils/client';
import type { Cookies } from '@sveltejs/kit';

const STORAGE_KEY_THEME_FIXED_NAME = 'theme_fixed_name';
const STORAGE_KEY_THEME_FIXED_SCHEME = 'theme_fixed_scheme';

export const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
] as const satisfies { name: string; scheme: 'light' | 'dark' }[];

export type Theme = (typeof THEMES)[number];

const DEFAULT_THEME = { name: 'amethyst', scheme: 'dark' } as const satisfies Theme;

export const getStoredThemeOnClient = (): Theme => {
	if (typeof window === 'undefined') return DEFAULT_THEME;
	const name = getBrowserCookie(STORAGE_KEY_THEME_FIXED_NAME);
	if (!name) return DEFAULT_THEME;
	const scheme = getBrowserCookie(STORAGE_KEY_THEME_FIXED_SCHEME);
	if (!scheme) return DEFAULT_THEME;
	return THEMES.find((t) => t.name === name && t.scheme === scheme) ?? DEFAULT_THEME;
};

export const getStoredThemeOnServer = (cookies: Cookies): Theme => {
	const name = cookies.get(STORAGE_KEY_THEME_FIXED_NAME);
	if (!name) return DEFAULT_THEME;
	const scheme = cookies.get(STORAGE_KEY_THEME_FIXED_SCHEME);
	if (!scheme) return DEFAULT_THEME;
	return THEMES.find((t) => t.name === name && t.scheme === scheme) ?? DEFAULT_THEME;
};

export const setThemeOnDoc = ({ name, scheme }: Theme) => {
	if (scheme === 'dark') {
		document.documentElement.classList.remove('light');
		document.documentElement.classList.add('dark');
		document.documentElement.dataset['theme'] = name;
	} else {
		document.documentElement.classList.add('light');
		document.documentElement.classList.remove('dark');
		document.documentElement.dataset['theme'] = name;
	}
};

export const storeThemeOnClient = ({ theme }: { theme: Theme }) => {
	setBrowserCookie(STORAGE_KEY_THEME_FIXED_NAME, theme.name);
	setBrowserCookie(STORAGE_KEY_THEME_FIXED_SCHEME, theme.scheme);
};
