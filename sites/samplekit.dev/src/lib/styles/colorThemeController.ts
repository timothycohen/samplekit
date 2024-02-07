import { get, writable } from 'svelte/store';
import {
	getStoredThemeDay,
	getStoredThemeMode,
	getStoredThemeNight,
	getSystemScheme,
	setModeInStorage,
	setThemeInStorage,
	setThemeOnDoc,
	type ModeApplied,
	type Mode,
	type SystemScheme,
	type Theme,
} from './colorThemeUtils';

const calcApplied = (a: { mode: Mode; schemeSystem: SystemScheme; themeNight: Theme; themeDay: Theme }) => {
	const modeApplied: ModeApplied =
		a.mode === 'fixed_day' ? 'day' : a.mode === 'fixed_night' ? 'night' : a.schemeSystem === 'dark' ? 'night' : 'day';

	const themeApplied: Theme = modeApplied === 'night' ? a.themeNight : a.themeDay;

	return { modeApplied, themeApplied };
};

const createThemeController = () => {
	const store = (() => {
		const schemeSystem: 'light' | 'dark' = getSystemScheme();
		const mode: 'fixed_day' | 'fixed_night' | 'sync_system' = getStoredThemeMode();
		const themeDay = getStoredThemeDay();
		const themeNight = getStoredThemeNight();
		const { modeApplied, themeApplied } = calcApplied({ schemeSystem, mode, themeDay, themeNight });

		return writable({
			initialized: false,
			schemeSystem,
			mode,
			themeDay,
			themeNight,
			modeApplied,
			themeApplied,
		});
	})();

	const setTheme = ({ kind, theme }: { kind: ModeApplied; theme: Theme }) => {
		store.update((s) => {
			if (kind === 'day') s.themeDay = theme;
			else if (kind === 'night') s.themeNight = theme;
			s = { ...s, ...calcApplied(s) };

			setThemeInStorage({ kind, theme });
			setThemeOnDoc(s.themeApplied);

			return s;
		});
	};

	const setMode = (mode: 'fixed_day' | 'fixed_night' | 'sync_system') => {
		store.update((s) => {
			s.mode = mode;
			s = { ...s, ...calcApplied(s) };

			setModeInStorage(s.mode);
			setThemeOnDoc(s.themeApplied);

			return s;
		});
	};

	const listen = (type: 'light-dark' | 'light-dark-system') => {
		if (!window.matchMedia || get(store).initialized) return { destroy: () => undefined };
		store.update((s) => ({ ...s, initialized: true }));

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const listener = (prefersDark: MediaQueryListEvent) => {
			const schemeSystem = prefersDark.matches ? 'dark' : 'light';
			const s = get(store);

			if (type === 'light-dark') {
				const mode = schemeSystem === 'dark' ? 'fixed_night' : 'fixed_day';
				setModeInStorage(mode);

				const modeApplied = schemeSystem === 'dark' ? 'night' : 'day';
				const themeApplied = schemeSystem === 'dark' ? s.themeNight : s.themeDay;
				setThemeOnDoc(themeApplied);

				store.update((s) => ({ ...s, schemeSystem, themeApplied, modeApplied, mode }));
			} else if (s.mode === 'sync_system') {
				const modeApplied = schemeSystem === 'dark' ? 'night' : 'day';
				const themeApplied = schemeSystem === 'dark' ? s.themeNight : s.themeDay;
				setThemeOnDoc(themeApplied);

				store.update((s) => ({ ...s, schemeSystem, themeApplied, modeApplied }));
			} else {
				store.update((s) => ({ ...s, schemeSystem }));
			}
		};

		mediaQuery.addEventListener('change', listener);
		return {
			destroy: () => mediaQuery.removeEventListener('change', listener),
		};
	};

	return {
		subscribe: store.subscribe,
		setMode,
		setTheme,
		listen,
	};
};

/** This implementation:
 *  - stores `theme_[day|night]_[name|scheme]` and `theme_sync_mode` in `document.cookies`.
 *
 *  - can have themes with one set of design tokens `[{ name: 'Sand', scheme: 'light' }, { name: 'Desert', scheme: 'dark' }]` or separate light/dark variables `[{ name: 'Sand', scheme: 'light' }, { name: 'Sand', scheme: 'dark' }]`
 *
 *  - applies the theme onto the document as `data-theme="{{ Theme }}"`.
 *
 *  - supports setting any theme to `theme_day` and `theme_night`. (a light theme can be applied to `theme_night`).
 *
 *  - applies the theme's color scheme onto the document as `class="light" | class="dark"` (if preferredDayTheme = { name: 'someLightTheme', scheme: 'dark' } the `class="dark"` will be applied).
 *
 *  `themeController.listen` listens for the user to change the `prefers-color-scheme` system preference.
 *
 *  - `themeController.listen('light-dark-system')` is made for a three way switch. If the preferred sync mode is `system` it updates `schemeApplied`.
 *
 *  - `themeController.listen('light-dark')` is made for a two way switch. When the system preference changes, it always updates `schemeApplied`, forces `syncMode` to use `schemeApplied`, and persists `syncMode` to `document.cookies`.
 *
 *		There are two downsides of a two-way switch:
 *		1. It won't follow system preferences if changed while the site isn't open.
 *		2. It will follow system preferences if changed while the site is open even if the user wants it fixed. The user will have to manually change it back.
 *
 *		Skipping the listener inverts the problem (it doesn't follow system changes while the site is open).
 * */
export const themeController = createThemeController();
