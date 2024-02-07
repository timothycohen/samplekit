// Compile this to /static/themeUtils.js and import into app.html to prevent FOUC

const STORAGE_KEY_THEME_DAY = 'theme_day';
const STORAGE_KEY_THEME_NIGHT = 'theme_night';
const STORAGE_KEY_THEME_SYNC_MODE = 'theme_sync_mode';
type Key = `${typeof STORAGE_KEY_THEME_DAY | typeof STORAGE_KEY_THEME_NIGHT}_${'name' | 'scheme'}` | 'theme_sync_mode';

function getStorage(name: Key): string | null {
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

function setStorage(name: Key, value: string, days?: number): void {
	let expires = '';

	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}

	document.cookie = `${name}=${value}${expires}; path=/`;
}

export type Theme = { name: string; scheme: 'light' | 'dark' };

/**
 * #### bellflower / amethyst
 * - success: Jade
 * - info: Cyan
 * - error: Ruby
 * - warning: Amber
 * - accent: Iris
 * - gray: Mauve
 *
 * #### daffodil / desert
 * - success: Green
 * - info: Blue
 * - error: Red
 * - warning: Yellow
 * - accent: Amber
 * - gray: Sand
 */
export const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
] as const satisfies Theme[];

export type SystemScheme = 'light' | 'dark';
export type Mode = 'fixed_day' | 'fixed_night' | 'sync_system';
export type ModeApplied = 'day' | 'night';

const DEFAULT_THEME_DAY = { name: 'bellflower', scheme: 'light' } as const satisfies Theme;
const DEFAULT_THEME_NIGHT = { name: 'amethyst', scheme: 'dark' } as const satisfies Theme;
const DEFAULT_THEME_SYNC_MODE: Mode = 'sync_system';

export const getSystemScheme = (): SystemScheme => {
	if (typeof window === 'undefined' || !window.matchMedia) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getStoredThemeMode = (): Mode => {
	if (typeof window === 'undefined') return DEFAULT_THEME_SYNC_MODE;
	const val = getStorage(STORAGE_KEY_THEME_SYNC_MODE);
	if (!val) return DEFAULT_THEME_SYNC_MODE;
	if (val === 'fixed_day' || val === 'fixed_night' || val === 'sync_system') return val;
	return DEFAULT_THEME_SYNC_MODE;
};

export const getStoredThemeDay = (): Theme => {
	if (typeof window === 'undefined') return DEFAULT_THEME_DAY;
	const name = getStorage(`${STORAGE_KEY_THEME_DAY}_name`);
	if (!name) return DEFAULT_THEME_DAY;
	const scheme = getStorage(`${STORAGE_KEY_THEME_DAY}_scheme`);
	if (!scheme) return DEFAULT_THEME_DAY;
	return THEMES.find((t) => t.name === name && t.scheme === scheme) ?? DEFAULT_THEME_DAY;
};

export const getStoredThemeNight = (): Theme => {
	if (typeof window === 'undefined') return DEFAULT_THEME_NIGHT;
	const name = getStorage(`${STORAGE_KEY_THEME_NIGHT}_name`);
	if (!name) return DEFAULT_THEME_NIGHT;
	const scheme = getStorage(`${STORAGE_KEY_THEME_NIGHT}_scheme`);
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

export const setThemeInStorage = ({ kind, theme }: { kind: ModeApplied; theme: Theme }) => {
	const storageKey: typeof STORAGE_KEY_THEME_DAY | typeof STORAGE_KEY_THEME_NIGHT = `theme_${kind}`;
	setStorage(`${storageKey}_name`, theme.name);
	setStorage(`${storageKey}_scheme`, theme.scheme);
};

export const setModeInStorage = (mode: Mode) => {
	setStorage(STORAGE_KEY_THEME_SYNC_MODE, mode);
};

export const _initTheme = () => {
	const mode = getStoredThemeMode();
	const appliedMode =
		mode === 'fixed_day' ? 'day' : mode === 'fixed_night' ? 'night' : getSystemScheme() === 'dark' ? 'night' : 'day';
	const themeApplied = appliedMode === 'night' ? getStoredThemeNight() : getStoredThemeDay();
	setThemeOnDoc(themeApplied);
};
