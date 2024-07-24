import { tick } from 'svelte';
import { dev } from '$app/environment';
import { THEMES, getStoredThemeOnClient, storeThemeOnClient, setThemeOnDoc, type Theme } from './themeUtils';

/**
 * stores theme_fixed_name and theme_fixed_scheme in document.cookies
 *
 * applies the theme onto the document as data-theme="{{ Theme }}" and class="light" | class="dark"
 *
 * provides an optional view transition when changing the theme
 */
export class ThemeController {
	#theme: Theme = $state(getStoredThemeOnClient());

	get scheme() {
		return this.#theme.scheme;
	}

	get theme() {
		return this.#theme.name;
	}

	#animateThemeOnDoc() {
		/**
		 * Credit [@hooray](https://github.com/hooray)
		 * @see https://github.com/vuejs/vitepress/pull/2347
		 */
		const allowTransition =
			// @ts-expect-error – experimental
			document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const el: SVGElement | null = document.querySelector('#palette-menu-btn');

		if (!allowTransition || !el) {
			setThemeOnDoc(this.#theme);
			return;
		}

		// @ts-expect-error – experimental
		const transition = document.startViewTransition(async () => {
			el.style.setProperty('--fill-color', window.getComputedStyle(el).getPropertyValue('--fill-color'));
			setThemeOnDoc(this.#theme);
			await tick();
		});

		const rect = el.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
		const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

		transition.ready.then(() => {
			const animation = document.documentElement.animate(
				{
					clipPath: this.#theme.scheme === 'dark' ? [...clipPath].reverse() : clipPath,
				},
				{
					duration: this.#theme.scheme === 'dark' ? 250 : 350,
					easing: 'ease-in-out',
					pseudoElement: this.#theme.scheme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)',
				},
			);
			animation.onfinish = () =>
				tick().then(() => {
					el.style.setProperty('--fill-color', null);
				});
		});
	}

	setTheme({ theme, animate }: { theme: Theme; animate: boolean }) {
		this.#theme = theme;
		storeThemeOnClient({ theme });
		if (animate) this.#animateThemeOnDoc();
		else setThemeOnDoc(this.#theme);
	}

	set theme(value: Theme['name']) {
		const theme = THEMES.find((t) => t.name === value);
		if (!theme) {
			// eslint-disable-next-line no-console
			if (dev) console.error(`Unknown theme name: ${value}`);
			return;
		}
		if (theme.name === this.#theme.name && theme.scheme === this.#theme.scheme) return;
		this.setTheme({ theme, animate: true });
	}
}
