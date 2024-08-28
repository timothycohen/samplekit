import { tick } from 'svelte';
import { storeMode, storeTheme } from './storeTheme';
import { setThemeOnDoc, type ModeApplied, type Theme, setSystemSchemeOnDoc } from './themeUtils';

export type InitialTheme = {
	systemScheme: 'light' | 'dark';
	mode: 'fixed_day' | 'fixed_night' | 'sync_system';
	themeDay: Theme;
	themeNight: Theme;
};

/**
 * stores theme_[day|night]_[name|scheme] and theme_sync_mode in document.cookies
 *
 * calculates the applied theme according to those values
 *
 * applies the theme onto the document as data-theme="{{ Theme }}" and class="light" | class="dark"
 *
 * updates the theme if necessary when the user changes their system settings
 *
 * provides an optional view transition when changing the theme
 */
export class ThemeController {
	#initializedOnClient = $state() as boolean;
	#systemScheme = $state() as 'light' | 'dark';
	#mode = $state() as 'fixed_day' | 'fixed_night' | 'sync_system';
	#themeDay = $state() as Theme;
	#themeNight = $state() as Theme;

	#modeApplied: ModeApplied = $derived(
		this.#mode === 'fixed_day'
			? 'day'
			: this.#mode === 'fixed_night'
				? 'night'
				: this.#systemScheme === 'light'
					? 'day'
					: 'night',
	);
	#themeApplied = $derived(this.#modeApplied === 'day' ? this.#themeDay : this.#themeNight);

	constructor(initial: InitialTheme) {
		this.#initializedOnClient = false;
		this.#systemScheme = initial.systemScheme;
		this.#mode = initial.mode;
		this.#themeDay = initial.themeDay;
		this.#themeNight = initial.themeNight;

		const listener = (prefersDark: MediaQueryListEvent) => {
			this.#systemScheme = prefersDark.matches ? 'dark' : 'light';
			setThemeOnDoc(this.#themeApplied);
			setSystemSchemeOnDoc(this.#systemScheme);
		};

		$effect(() => {
			this.#initializedOnClient = true;
			window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', listener);
			return () => {
				window.matchMedia?.('(prefers-color-scheme: dark)').removeEventListener('change', listener);
			};
		});
	}

	setTheme({ kind, theme, animate }: { kind: ModeApplied; theme: Theme; animate: boolean }) {
		if (kind === 'day') this.#themeDay = theme;
		else this.#themeNight = theme;
		storeTheme({ kind, theme });
		if (animate) this.#animateThemeOnDoc();
		else setThemeOnDoc(this.#themeApplied);
	}

	setMode(mode: 'fixed_day' | 'fixed_night' | 'sync_system', opts: { animate: boolean }) {
		this.#mode = mode;
		storeMode(this.#mode);
		if (opts.animate) this.#animateThemeOnDoc();
		else setThemeOnDoc(this.#themeApplied);
	}

	get initializedOnClient() {
		return this.#initializedOnClient;
	}
	get systemScheme() {
		return this.#systemScheme;
	}
	get mode() {
		return this.#mode;
	}
	set mode(mode: 'fixed_day' | 'fixed_night' | 'sync_system') {
		this.setMode(mode, { animate: false });
	}
	get themeDay() {
		return this.#themeDay;
	}
	set themeDay(theme) {
		this.setTheme({ kind: 'day', theme, animate: false });
	}
	get themeNight() {
		return this.#themeNight;
	}
	set themeNight(theme) {
		this.setTheme({ kind: 'night', theme, animate: false });
	}
	get modeApplied() {
		return this.#modeApplied;
	}
	get themeApplied() {
		return this.#themeApplied;
	}

	#animateThemeOnDoc() {
		/**
		 * Credit [@hooray](https://github.com/hooray)
		 * @see https://github.com/vuejs/vitepress/pull/2347
		 */
		const allowTransition =
			// @ts-expect-error – experimental
			document.startViewTransition &&
			!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
			// Too buggy on mobile. The clip path is offset by the status bar height and it causes some elements to be cut off
			window.innerWidth >= 620;

		const el: SVGElement | null = document.querySelector('label[for="theme-switch-btn"]');

		if (!allowTransition || !el) {
			setThemeOnDoc(this.#themeApplied);
			return;
		}

		// @ts-expect-error – experimental
		const transition = document.startViewTransition(async () => {
			setThemeOnDoc(this.#themeApplied);
			await tick();
		});

		const rect = el.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
		const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

		transition.ready.then(() => {
			document.documentElement.animate(
				{
					clipPath: this.#modeApplied === 'night' ? [...clipPath].reverse() : clipPath,
				},
				{
					duration: this.#modeApplied === 'night' ? 250 : 350,
					easing: 'ease-in-out',
					pseudoElement: this.#modeApplied === 'night' ? '::view-transition-old(root)' : '::view-transition-new(root)',
				},
			);
		});
	}
}
