// Compile this to /static/themeUtils.js and import into app.html to prevent FOUC

export const STORAGE_KEY_THEME_DAY = 'theme_day';
export const STORAGE_KEY_THEME_NIGHT = 'theme_night';
export const STORAGE_KEY_THEME_SYNC_MODE = 'theme_sync_mode';
export type StorageKey =
	| `${typeof STORAGE_KEY_THEME_DAY | typeof STORAGE_KEY_THEME_NIGHT}_${'name' | 'scheme'}`
	| typeof STORAGE_KEY_THEME_SYNC_MODE;

export const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
] as const satisfies { name: string; scheme: 'light' | 'dark' }[];

export type Theme = (typeof THEMES)[number];
export type SystemScheme = Theme['scheme'];
export type Mode = 'fixed_day' | 'fixed_night' | 'sync_system';
export type ModeApplied = 'day' | 'night';

const DEFAULT_THEME_DAY = { name: 'bellflower', scheme: 'light' } as const satisfies Theme;
const DEFAULT_THEME_NIGHT = { name: 'amethyst', scheme: 'dark' } as const satisfies Theme;
const DEFAULT_THEME_SYNC_MODE: Mode = 'sync_system';

export const normalizeThemeMode = (val: string | null | undefined): Mode => {
	if (!val) return DEFAULT_THEME_SYNC_MODE;
	if (val === 'fixed_day' || val === 'fixed_night' || val === 'sync_system') return val;
	return DEFAULT_THEME_SYNC_MODE;
};

export const normalizeThemeDay = (
	name: string | null | undefined,
	getter: (key: StorageKey) => string | null | undefined,
): Theme => {
	if (!name) return DEFAULT_THEME_DAY;
	const scheme = getter(`${STORAGE_KEY_THEME_DAY}_scheme`);
	if (!scheme) return DEFAULT_THEME_DAY;
	return THEMES.find((t) => t.name === name && t.scheme === scheme) ?? DEFAULT_THEME_DAY;
};

export const normalizeThemeNight = (
	name: string | null | undefined,
	getter: (key: StorageKey) => string | null | undefined,
): Theme => {
	if (!name) return DEFAULT_THEME_NIGHT;
	const scheme = getter(`${STORAGE_KEY_THEME_NIGHT}_scheme`);
	if (!scheme) return DEFAULT_THEME_NIGHT;
	return THEMES.find((t) => t.name === name && t.scheme === scheme) ?? DEFAULT_THEME_NIGHT;
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

export const setSystemSchemeOnDoc = (systemScheme: SystemScheme) => {
	document.documentElement.setAttribute('data-prefer-scheme', systemScheme);
};

function getBrowserCookie(name: StorageKey): string | null {
	const nameEQ = `${name}=`;
	const cookies = document.cookie.split(';');

	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i];
		while (cookie?.charAt(0) === ' ') {
			cookie = cookie.substring(1, cookie.length);
		}
		if (cookie?.indexOf(nameEQ) === 0) {
			return cookie.substring(nameEQ.length, cookie.length);
		}
	}

	return null;
}

export const getSystemScheme = (): SystemScheme => {
	if (typeof window === 'undefined' || !window.matchMedia) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getStoredThemeModeClient = (): Mode => {
	return normalizeThemeMode(getBrowserCookie(STORAGE_KEY_THEME_SYNC_MODE));
};

export const getStoredThemeDayClient = (): Theme => {
	return normalizeThemeDay(getBrowserCookie(`${STORAGE_KEY_THEME_DAY}_name`), getBrowserCookie);
};

export const getStoredThemeNightClient = (): Theme => {
	return normalizeThemeNight(getBrowserCookie(`${STORAGE_KEY_THEME_NIGHT}_name`), getBrowserCookie);
};

export const initTheme = () => {
	const mode = getStoredThemeModeClient();
	const systemScheme = getSystemScheme();
	const appliedMode =
		mode === 'fixed_day' ? 'day' : mode === 'fixed_night' ? 'night' : systemScheme === 'light' ? 'day' : 'night';
	const themeApplied = appliedMode === 'night' ? getStoredThemeNightClient() : getStoredThemeDayClient();
	setThemeOnDoc(themeApplied);
	setSystemSchemeOnDoc(systemScheme);
};
