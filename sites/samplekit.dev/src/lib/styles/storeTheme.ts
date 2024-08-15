import { normalizeThemeDay, normalizeThemeMode, normalizeThemeNight, STORAGE_KEY_THEME_SYNC_MODE } from './themeUtils';
import type {
	Mode,
	ModeApplied,
	STORAGE_KEY_THEME_NIGHT,
	STORAGE_KEY_THEME_DAY,
	StorageKey,
	Theme,
} from './themeUtils';
import type { Cookies } from '@sveltejs/kit';

function setBrowserCookie(name: StorageKey, value: string, days?: number): void {
	let expires = '';

	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}

	document.cookie = `${name}=${value}${expires}; path=/`;
}

export const storeTheme = ({ kind, theme }: { kind: ModeApplied; theme: Theme }) => {
	const storageKey: typeof STORAGE_KEY_THEME_DAY | typeof STORAGE_KEY_THEME_NIGHT = `theme_${kind}`;
	setBrowserCookie(`${storageKey}_name`, theme.name);
	setBrowserCookie(`${storageKey}_scheme`, theme.scheme);
};

export const storeMode = (mode: Mode) => {
	setBrowserCookie(STORAGE_KEY_THEME_SYNC_MODE, mode);
};

export const getThemeOnServer = (cookies: Cookies) => ({
	mode: normalizeThemeMode(cookies.get('theme_sync_mode' satisfies StorageKey)),
	themeDay: normalizeThemeDay(cookies.get('theme_day_name' satisfies StorageKey), cookies.get),
	themeNight: normalizeThemeNight(cookies.get('theme_night_name' satisfies StorageKey), cookies.get),
});
