<script lang="ts" module>
	import { GH_TREE } from '$lib/consts';
	import video from './assets/2024-08-05_19-56-30_800x645.mp4';
	import imgLg from './assets/theme-controller-q30.webp';
	import imgSm from './assets/theme-controller-thumbnail-1200w.webp';
	import type { RawFrontMatter } from '$lib/articles/schema';

	export const metadata = {
		title: 'Theme Controller',
		implementationPath: '/appearance',
		srcCodeHref: `${GH_TREE}/sites/samplekit.dev/src/lib/styles`,
		description:
			'A theme controller that uses CSS variables to control light/dark mode with multiple themes, saves user preference to Cookies, and avoids flashes of unstyled content.',
		publishedAt: new Date('2024-03-06 13:36:17 -0500'),
		updates: [
			{ at: new Date('2024-08-13 18:53:19 -0400'), descriptions: ['Update to runes.', 'Add view transition.'] },
		],
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		imgSm,
		imgLg,
		video,
		tags: ['dark mode', 'multiple themes', 'tailwind', 'css variables', 'FOUC'],
		featured: true,
	} satisfies RawFrontMatter;
</script>

<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';
	import { HAnchor } from '$lib/components';
	import { GH_ROOT } from '$lib/consts';
</script>

<p>
	When given the opportunity, I nearly always switch to dark mode. From cursory Googling, it seems a majority of people
	share that preference. For example, an
	<a href="https://www.androidauthority.com/dark-mode-poll-results-1090716/" data-external>Android Authority poll</a>
	showed 81.9% of their users choose dark mode.
</p>

<p>
	If you clicked on that link you may have noticed the option to toggle between light and dark mode. However, there's no
	option to sync with device setting. Also, if you opened the page while your device was set to dark mode, you were
	probably blinded by an <code>#FFF</code> background until the JavaScript kicked in. These are not uncommon issues, but
	in this article we're going to overcome them.
</p>

<HAnchor tag="h2" title="Goals" />

<p>Let's build a color theming system for SvelteKit with all these benefits:</p>

<div class="w-fit rounded-badge border border-accent-5 bg-accent-2 p-4">
	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">
			Compatibility with design tokens from popular sources like
			<a href="https://www.radix-ui.com/colors" data-external>Radix</a>,
			<a href="https://designsystem.digital.gov/utilities/color/" data-external>USWDS</a>,
			<a href="https://daisyui.com/docs/themes/" data-external>DaisyUI</a>, or
			<a href="https://tailwindcss.com/docs/customizing-colors" data-external>TailwindCSS</a>
		</span>
	</div>
	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">Integration and intellisense with Tailwind</span>
	</div>

	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">Full user control </span>
	</div>

	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">Persistent preference storage available on the client and server</span>
	</div>
</div>

<p>And none of the downsides:</p>

<div class="w-fit rounded-badge border border-accent-5 bg-accent-2 p-4">
	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">
			Flash of Unstyled Content – or more precisely, incorrectly styled content – while loading a user's stored settings
		</span>
	</div>

	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">Bloated light and dark css classes for every component</span>
	</div>

	<div class="grid grid-cols-[48px_1fr]">
		<span class="text-gray-9">☐</span>
		<span class="text-left">Synchronization problems with system settings</span>
	</div>
</div>

<p>
	This website shows one such implementation using the methods described below. The complete source code can be found at
	<a href="{GH_TREE}/sites/samplekit.dev/src/lib/styles" data-external> $lib/styles </a>.
</p>

<HAnchor tag="h2" title="Organizing the CSS" />

<p>
	Before we create the components and logic to handle multiple themes, we should think about how we want to implement
	the colors in our CSS. Let's consider two ways to organize our color design tokens that will make it easy to use in
	CSS (and later Tailwind).
</p>

<HAnchor tag="h3" title="Two design token sets for each theme" />

<p>First an example using <a href="https://github.com/radix-ui/colors" data-external>Radix UI Colors</a>:</p>

<CodeTopper title="adaptiveColorThemes.css">
	<!-- shiki-start
```css
.light {
	--blue-5: 205.6deg 100% 88%;
}
.dark {
	--blue-5: 206.9deg 100% 22.7%;
}
[data-theme='adaptive-theme'] {
	--info-5: var(--blue-5);
}
```
shiki-end -->
</CodeTopper>

<CodeTopper title="tailwind.config.ts">
	<!-- shiki-start
		```ts
const colors = {//! d"hide"
colors: {
	...,
	info: {
		'1': `hsl(var(--info-5) / <alpha-value>)`
	},
	...
}
}//! d"hide"
```
shiki-end -->
</CodeTopper>

<p>
	Organizing the theme this way means each color variable references two separate design tokens – one for light mode and
	one for dark mode.
</p>

<p>
	By changing <code>class="light"</code> to <code>class="dark"</code>, all the themed color variables will change.
</p>

<CodeTopper title="src/app.html">
	<!-- shiki-start
```html
<html lang="en" data-theme="adaptive-theme" class="light">//!d"highlight" s#"class="light""#
	...
	<p class="border-info-5 border">Hi</p>
	...
</html>
```
shiki-end -->
</CodeTopper>

<CodeTopper title="src/app.html">
	<!-- shiki-start
```html
<html lang="en" data-theme="adaptive-theme" class="dark">//!d"highlight" s#"class="dark""#
	...
	<p class="border-info-5 border">Hi</p>
	...
</html>
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="One design token set for each theme" />

<p>Now lets look at an example using a <a href="https://daisyui.com/docs/themes/" data-external>DaisyUI</a> theme:</p>

<CodeTopper title="staticColorThemes.css">
	<!-- shiki-start
```css
[data-theme='cupcake'] {
	/* --p is short for primary */
	--p: 0.76172 0.089459 200.026556;
}
[data-theme='business'] {
	--p: 0.417036 0.099057 251.473931;
}
```
shiki-end -->
</CodeTopper>

<CodeTopper title="src/app.html">
	<!-- shiki-start
```html
&openhtmlcomment; only the data-theme matters for the css.
	   class="light" is optional here,
	   but it can be useful for overriding with tailwind &closehtmlcomment;
<html lang="en" data-theme="cupcake" class="light">//!d"highlight" s#"data-theme="cupcake""#
	...
	<p class="border-primary border">Hi</p>
	...
</html>
```
shiki-end -->
</CodeTopper>

<CodeTopper title="src/app.html">
	<!-- shiki-start
```html
<html lang="en" data-theme="business" class="dark">//!d"highlight" s#"data-theme="business""#
	...
	<p class="border-primary border">Hi</p>
	...
</html>
```
shiki-end -->
</CodeTopper>

<p>With this organization, the theme is always fixed to either a light or dark mode.</p>

<HAnchor tag="h3" title="Lifting design tokens up" />

<p>If we look back at our Radix UI example:</p>

<CodeTopper title="adaptiveColorThemes.css">
	<!-- shiki-start
```css
.light {
	--blue-5: 205.6deg 100% 88%;
}
.dark {
	--blue-5: 206.9deg 100% 22.7%;
}
[data-theme='adaptive-theme'] {
	--info-5: var(--blue-5);
}
```
shiki-end -->
</CodeTopper>

<p>
	We can see that there is no direct way to use a light <code>--blue-5</code> while in dark mode. We can fix this by pulling
	the variables up one level.
</p>

<CodeTopper title="adaptiveColorThemes.css">
	<!-- shiki-start
```css
:root {
	--blue-5-light: 205.6deg 100% 88%;
	--blue-5-dark: 206.9deg 100% 22.7%;
}
.light {
	--blue-5: var(--blue-5-light);
}
.dark {
	--blue-5: var(--blue-5-dark);
}
[data-theme='adaptive-theme'] {
	--info-5: var(--blue-5);
}
```
shiki-end -->
</CodeTopper>

<p>Similarly:</p>

<CodeTopper title="staticColorThemes.css">
	<!-- shiki-start
```css
:root {
	--cupcake-p: 0.76172 0.089459 200.026556;
	--business-p: 0.417036 0.099057 251.473931;
}
[data-theme='cupcake'] {
	--p: var(--cupcake-p);
}
[data-theme='business'] {
	--p: var(--business-p);
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Choosing an organization method" />

<p>
	Both methods of organization work equally, but one might be more convenient depending on where the design tokens are
	coming from and how the customization options are presented to the user. The rest of this article will use the "two
	tokens per theme" or "Radix UI" approach.
</p>

<HAnchor tag="h2" title="Controller Components" />

<div>
	Now that we've pulled some design tokens into our css, we can control the entire theme using just
	<code>data-theme</code> and <code>class</code> attributes on some top level HTML tag. Our state with then look like:
	<!-- shiki-ts type Theme = { name: string, scheme: 'light' | 'dark' }; shiki-ts -->. We can force specific components
	to use a different theme by adding a wrapper with those properties.
</div>

<p>This website uses these themes:</p>

<CodeTopper title="themeUtils.ts">
	<!-- shiki-start
```ts
export const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
] as const satisfies { name: string; scheme: 'light' | 'dark' }[];

export type Theme = (typeof THEMES)[number];
```
shiki-end -->
</CodeTopper>

<p>But how should we let the user interact with these two attributes?</p>

<p>
	Depending on how many themes are supported and whether we allow syncing the theme to a user's browser preference, we
	have the following options of components for our users:
</p>

<!-- md-start
| Theme Count | System Sync | Kind                                                                                                                                                                                                                                                                                                                                    | Examples                                                                                                                                                    |
| ----------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2           | No          | Day / Night switch [[Source]](https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/styles/components/ThemeSwitchDayNight.svelte)                                                                                                                                                                             | [Svelte](https://svelte.dev/), [React](https://react.dev/)                                                                                                  |
| 2           | Yes         | Day / Night / System select [[Source]](https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/styles/components/ThemeSwitchDayNightSystem.svelte)                                                                                                                                                              | [Tailwind](https://tailwindcss.com/), [Supabase](https://supabase.com/dashboard/account/me), [LinkedIn](https://www.linkedin.com/mypreferences/d/dark-mode) |
| 3+          | No          | Fixed theme picker                                                                                                                                                                                                                                                                                                                      | [DaisyUI](https://daisyui.com/docs/themes/), [Rust Book](https://doc.rust-lang.org/book/), [Gitlab](https://gitlab.com/-/profile/preferences)                |
| 3+          | Yes         | Day / Night theme pickers [[Source]](https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/styles/components/ThemePicker.svelte) + Day / Night / System select [[Source]](https://github.com/timothycohen/samplekit/blob/main/sites/samplekit.dev/src/lib/styles/components/ThemeSwitchDayNightSystem.svelte) | [GitHub](https://github.com/settings/appearance)                                                                                                            |
md-end -->

<p>
	The first two are by far the most familiar. Most sites have a specific character they want to showcase, and that
	includes a carefully chosen color palette.
</p>

<p>
	Of those two, the <code>Day / Night</code> switch is simpler, but because it doesn't consider if the user wants to
	sync with their system, they would have to manually change the site theme when their system changed (or override the
	changes from an <code>EventListener</code> if we set one).
</p>

<p>The third, – <code>fixed theme picker</code> – gives the user the power to personalize the site.</p>

<p>The controller can be as simple as this:</p>

<CodeTopper title="Fixed Theme Picker Controller">
	<!-- shiki-start
```ts
import { THEMES, getStoredThemeOnClient, storeThemeOnClient, setThemeOnDoc, type Theme } from './themeUtils';

/**
 * stores theme_fixed_name and theme_fixed_scheme in document.cookies
 *
 * applies the theme onto the document as data-theme="{{ Theme }}" and class="light" | class="dark"
 */
export class ThemeController {
	#theme: Theme = $state(getStoredThemeOnClient());

	get scheme() {
		return this.#theme.scheme;
	}

	get theme() {
		return this.#theme.name;
	}

	set theme(value: Theme['name']) {
		const theme = THEMES.find((t) => t.name === value);
		if (!theme) return
		if (theme.name === this.#theme.name && theme.scheme === this.#theme.scheme) return;
		this.#theme = theme;
		storeThemeOnClient({ theme });
		setThemeOnDoc(this.#theme);
	}
}
```
shiki-end -->
</CodeTopper>

<p>This website, however, implements the last and most flexible option.</p>

<HAnchor tag="h2" title="Controller" />

<p>Our theme service will have state synced in three places.</p>

<ol>
	<li>
		Component reactivity: <!-- shiki-ts $state() shiki-ts --> or <!-- shiki-ts writable() shiki-ts -->
	</li>
	<li>Permanent storage: Either <code>Cookies</code> or <code>LocalStorage</code></li>
	<li>
		HTML: <!-- shiki-html <html data-theme="{{ themeApplied.name }}" class="{{ themeApplied.scheme }}" data-prefer-scheme="{{ SystemScheme }}"> shiki-html -->
	</li>
</ol>

<HAnchor tag="h3" title="State" />

<p>
	Because we'll be using the data in our theme controller components, we'll need some Svelte store or rune reactivity.
</p>

<CodeTopper title="themeUtils.ts">
	<!-- shiki-start
```ts
export type SystemScheme = 'light' | 'dark';
export type Mode = 'fixed_day' | 'fixed_night' | 'sync_system';
export type ModeApplied = 'day' | 'night';
```
shiki-end -->
</CodeTopper>

<CodeTopper title="themeController.svelte.ts">
	<!-- shiki-start
```ts
export class ThemeController {
	// the browser `prefers-color-scheme`
	#systemScheme = $state() as SystemScheme;
	// the toggle switch between fixed light/dark modes or system sync
	#mode = $state() as Mode;
	// the user's preferred day theme
	#themeDay = $state() as Theme;
	// the user's preferred night theme
	#themeNight = $state() as Theme;

	// the mode applied after converting sync_system to the user's preferred scheme
	#modeApplied: ModeApplied = $derived(
		this.#mode === 'fixed_day'
			? 'day'
			: this.#mode === 'fixed_night'
				? 'night'
				: this.#systemScheme === 'light'
					? 'day'
					: 'night',
	);

	// the theme actually applied
	#themeApplied = $derived(this.#modeApplied === 'day' ? this.#themeDay : this.#themeNight);

	// knowing if the store is initialized can be useful when loading external scripts
	// that render light/dark components (for example Turnstile or reCAPTCHA)
	#initializedOnClient = $state(false);
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Storage" />

<p>
	Each setter will also need to store the state so it's available when refreshing. If using <code>localStorage</code>,
	it can be as simple as:
</p>

<CodeTopper title="themeUtils.ts">
	<!-- shiki-start
```ts
const STORAGE_KEY_THEME_DAY = 'theme_day';
const STORAGE_KEY_THEME_NIGHT = 'theme_night';
const STORAGE_KEY_THEME_SYNC_MODE = 'theme_sync_mode';

type Key =
	| `${typeof STORAGE_KEY_THEME_DAY | typeof STORAGE_KEY_THEME_NIGHT}_${'name' | 'scheme'}`
	| 'theme_sync_mode';

function getStorage(name: Key): string | null {
	return localStorage.getItem(key);
}

function setStorage(name: Key, value: string, days?: number): void {
	localStorage.setItem(key, value);
}
```
shiki-end -->
</CodeTopper>

<p>
	Note that we store <code>theme_day_scheme</code> and <code>theme_night_scheme</code> without assuming
	<code>theme_day_scheme=light</code> and <code>theme_night_scheme=dark</code>. This gives the user the option, for
	example, to have a "light" theme during the day and a dimmer "light" theme during the night.
</p>

<p>If we want to have access to the values on the server, we might prefer <code>Cookies</code>.</p>

<CodeTopper title="+layout.server.ts">
	<!-- shiki-start
```ts
const getThemeOnServer = (cookies: Cookies) => ({
	mode: normalizeThemeMode(cookies.get('theme_sync_mode' satisfies StorageKey)),
	themeDay: normalizeThemeDay(cookies.get('theme_day_name' satisfies StorageKey), cookies.get),
	themeNight: normalizeThemeNight(cookies.get('theme_night_name' satisfies StorageKey), cookies.get),
});

export const load: LayoutServerLoad = async ({ cookies }) => {
	return { theme: getThemeOnServer(cookies) };
	// {
	//   mode: 'fixed_night',
	//   themeDay: { name: 'bellflower', scheme: 'light' },
	//   themeNight: { name: 'amethyst', scheme: 'dark' }
	// }
};
```
shiki-end -->
</CodeTopper>

<CodeTopper title="themeUtils.ts">
	<!-- shiki-start
```ts
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

function setBrowserCookie(name: StorageKey, value: string, days?: number): void {
	let expires = '';

	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}

	document.cookie = `${name}=${value}${expires}; path=/`;
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Document" />

<p>And finally, none of this matters if the state isn't actually applied to the document.</p>

<p>Let's create the necessary helper functions.</p>

<CodeTopper title="themeUtils.ts">
	<!-- shiki-start
```ts
// Compile this to /static/themeUtils.js and import into app.html to prevent FOUC

export const STORAGE_KEY_THEME_DAY = 'theme_day';
export const STORAGE_KEY_THEME_NIGHT = 'theme_night';
export const STORAGE_KEY_THEME_SYNC_MODE = 'theme_sync_mode';
export type StorageKey =
	| `${typeof STORAGE_KEY_THEME_DAY | typeof STORAGE_KEY_THEME_NIGHT}_${'name' | 'scheme'}`
	| 'theme_sync_mode';

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

export const THEMES = [
	{ name: 'daffodil', scheme: 'light' },
	{ name: 'desert', scheme: 'dark' },
	{ name: 'bellflower', scheme: 'light' },
	{ name: 'amethyst', scheme: 'dark' },
] as const satisfies { name: string; scheme: 'light' | 'dark' }[];

export type Theme = (typeof THEMES)[number];
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

export const getStoredThemeModeClient = (): Mode => {
	return normalizeThemeMode(getBrowserCookie(STORAGE_KEY_THEME_SYNC_MODE));
};

export const getStoredThemeDayClient = (): Theme => {
	return normalizeThemeDay(getBrowserCookie(`${STORAGE_KEY_THEME_DAY}_name`), getBrowserCookie);
};

export const getStoredThemeNightClient = (): Theme => {
	return normalizeThemeNight(getBrowserCookie(`${STORAGE_KEY_THEME_NIGHT}_name`), getBrowserCookie);
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
```
shiki-end -->
</CodeTopper>

<p>Now we can add our set methods on our controller.</p>

<CodeTopper title="themeController.svelte.ts">
	<!-- shiki-start
```ts
export class ThemeController {
	...
	setTheme({ kind, theme }: { kind: ModeApplied; theme: Theme }) {
		if (kind === 'day') this.#themeDay = theme;
		else this.#themeNight = theme;
		storeTheme({ kind, theme });
		setThemeOnDoc(this.#themeApplied);
	}

	setMode(mode: 'fixed_day' | 'fixed_night' | 'sync_system') {
		this.#mode = mode;
		storeMode(this.#mode);
		setThemeOnDoc(this.#themeApplied);
	}
	...
}
```
shiki-end -->
</CodeTopper>

<p>
	We'll also need to make sure that if the user changes their system preference while the site is open, the systemScheme
	is changed, which will then update the <code>modeApplied</code> and <code>themeApplied</code>. We can set up a
	listener in the constructor.
</p>

<CodeTopper title="themeController.svelte.ts">
	<!-- shiki-start
```ts
export class ThemeController {
	...
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
	...
}
```
shiki-end -->
</CodeTopper>

<p>And now we can implement the getters and setters consumed by the controller.</p>

<CodeTopper title="themeController.svelte.ts">
	<!-- shiki-start
```ts
class ThemeController {
	...
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
		this.setMode(mode);
	}
	get themeDay() {
		return this.#themeDay;
	}
	set themeDay(theme) {
		this.setTheme({ kind: 'day', theme });
	}
	get themeNight() {
		return this.#themeNight;
	}
	set themeNight(theme) {
		this.setTheme({ kind: 'night', theme });
	}
	get modeApplied() {
		return this.#modeApplied;
	}
	get themeApplied() {
		return this.#themeApplied;
	}
	...
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h3" title="Prevent FOUC" />

<p>The only thing left on our checklist is to remove the flash of the wrong theme when the user refreshes.</p>

<p>We can completely eliminate this by calling some (blocking) init logic in <code>app.html</code>.</p>

<p>
	I prefer to write a short script inside <code>themeUtils.ts</code>, compile it with a script into
	<code>/static</code>, and call it in <code>app.html</code>.
</p>

<CodeTopper title="themeUtils.ts">
	<!-- shiki-start
```ts
export const initTheme = () => {
	const mode = getStoredThemeModeClient();
	const systemScheme = getSystemScheme();
	const appliedMode =
		mode === 'fixed_day' ? 'day' : mode === 'fixed_night' ? 'night' : systemScheme === 'light' ? 'day' : 'night';
	const themeApplied = appliedMode === 'night' ? getStoredThemeNightClient() : getStoredThemeDayClient();
	setThemeOnDoc(themeApplied);
	setSystemSchemeOnDoc(systemScheme);
};
```
shiki-end -->
</CodeTopper>

<CodeTopper title="package.json">
	<!-- shiki-start
	```json
"generate:theme_utils": "./scripts/generate-theme-utils.sh",
```
shiki-end -->
</CodeTopper>

<CodeTopper title="scripts/generate-theme-utils.sh">
	<!-- shiki-start
```sh
cd src/lib/styles &&
	cp themeUtils.ts themeUtils.tmp.ts &&
	sed -i '' 's/export //g' themeUtils.tmp.ts &&
	npx tsc themeUtils.tmp.ts &&
	mv themeUtils.tmp.js ../../../static/themeUtils.js &&
	rm themeUtils.tmp.ts
```
shiki-end -->
</CodeTopper>

<CodeTopper title="app.html">
	<!-- shiki-start
	```html
<!doctype html>
<html lang="en" data-theme="amethyst" class="dark">
	<head>
		&openhtmlcomment; theme &closehtmlcomment;
		<script src="/themeUtils.js"></script>
		<script>
			initTheme();
		</script>
		...
	</head>
	...
</html>
```
shiki-end -->
</CodeTopper>

<div>
	Alternatively, you could write a placeholder like <!-- shiki-html <html lang="en" replace-me-with-theme> shiki-html -->
	in <code>app.html</code> and then replace it in <code>hooks.server.ts</code> using the request cookies. That's nice
	because it doesn't require a separate init script, but it won't work with <code>adapter-static</code>.
</div>

<HAnchor tag="h2" title="Using our theme" />

<HAnchor tag="h3" title="CSS" />

<p>In our css, we can write:</p>

<!-- shiki-start
```html
<span class="red-box">I'm red!</span>

<style>
	.red-box {
		background-color: hsl(var(--red-5));
		border: 1px solid hsl(var(--red-7));
		width: fit-content;
	}
</style>
```
shiki-end -->

<p>
	And it will render as:
	<span style="background-color: hsl(var(--red-5)); border: 1px solid hsl(var(--red-7)); width: fit-content;"
		>I'm red!</span
	>
</p>

<p>
	Notice that we didn't have to write light, dark, or theme specific styles. The correct design token is used
	automatically when the user switches modes or theme.
</p>

<p>
	And our design tokens aren't just limited to colors! Things like border radii can make something seem more fun or
	trustworthy and definitely belong in the theme.
</p>

<HAnchor tag="h3" title="Tailwind" />

<p>
	Getting this working with Tailwind is easy. This is for Radix UI, so each Tailwind class references one of its 12 css
	variables. If it's gray, it also has alpha colors. Otherwise, it has a special "contrast" color. Just adapt it to
	whatever design tokens you have.
</p>

<CodeTopper title="tailwind.config.ts">
	<!-- shiki-start
```ts
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

export default {
	darkMode: ['class'],
	content: ['./src/**/*.{html,svelte,js,ts}'],
	theme: {
		...
		colors: createAllColors(),
		...
	},
	...
} satisfies Config;
```
shiki-end -->
</CodeTopper>

<p>Now our css example from before:</p>

<!-- shiki-start
```html
<span class="red-box">I'm red!</span>

<style>
	.red-box {
		background-color: hsl(var(--red-5));
		border: 1px solid hsl(var(--red-7));
		width: fit-content;
	}
</style>
```
shiki-end -->

<p>Can be written (with intellisense) as:</p>

<!-- shiki-start
	```html
<span class="bg-red-5 border-red-7 w-fit border">I'm red!</span>
```
shiki-end -->

<p>
	And it will still render as:
	<span class="w-fit border border-red-7 bg-red-5">I'm red!</span>
</p>

<HAnchor tag="h2" title="Bonus Animation" />

<p>
	I saw a fun View Transition pull request on the VitePress repo by user hooray. As of August 2024, the API only has 72%
	global usage, but it's a fun progressive enhancement, so let's add it.
</p>

<CodeTopper title="themeController.svelte.ts">
	<!-- shiki-start
```ts
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

setTheme({ kind, theme, animate }: { kind: ModeApplied; theme: Theme; animate: boolean }) {//! d"diff-add" s"animate: boolean"
	if (kind === 'day') this.#themeDay = theme;
	else this.#themeNight = theme;
	storeTheme({ kind, theme });
	if (animate) this.#animateThemeOnDoc();//! d"diff-add"
	else setThemeOnDoc(this.#themeApplied);//! d"diff-add"
}

setMode(mode: 'fixed_day' | 'fixed_night' | 'sync_system', opts: { animate: boolean }) {//! d"diff-add" s"animate: boolean"
	this.#mode = mode;
	storeMode(this.#mode);
	if (opts.animate) this.#animateThemeOnDoc();//! d"diff-add"
	else setThemeOnDoc(this.#themeApplied);//! d"diff-add"
}

set mode(mode: 'fixed_day' | 'fixed_night' | 'sync_system') {
	this.setMode(mode, { animate: false });//! d"diff-add" s"{ animate: false }"
}
set themeDay(theme) {
	this.setTheme({ kind: 'day', theme, animate: false });//! d"diff-add" s"animate: false"
}
set themeNight(theme) {
	this.setTheme({ kind: 'night', theme, animate: false });//! d"diff-add" s"animate: false"
}
```
shiki-end -->
</CodeTopper>

<CodeTopper title="app.css">
	<!-- shiki-start
```css
::view-transition-old(root),
::view-transition-new(root) {
	animation: none;
	mix-blend-mode: normal;
}
::view-transition-old(root) {
	z-index: 1;
}
::view-transition-new(root) {
	z-index: 9999;
}
.dark::view-transition-old(root) {
	z-index: 9999;
}
.dark::view-transition-new(root) {
	z-index: 1;
}
```
shiki-end -->
</CodeTopper>

<HAnchor tag="h2" title="Conclusion" />
<p>
	This is just one way of implementing a theming system in SvelteKit, but we can safely say we've checked all the boxes
	we set out to check.
</p>

<div class="w-fit rounded-badge border border-accent-5 bg-accent-2 p-4">
	<div class="flex h-full flex-col justify-around">
		<p class="my-0 ml-12 font-bold">Attain</p>

		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Compatibility with design tokens from popular sources</span>
		</div>
		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Integration and intellisense with Tailwind</span>
		</div>

		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Full user control </span>
		</div>

		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Persistent preference storage available on the client (and optionally the server)</span>
		</div>

		<p class="my-0 ml-12 mt-12 font-bold">Avoid</p>

		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Flash of Unstyled Content</span>
		</div>

		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Bloated light and dark css classes for every component</span>
		</div>

		<div class="grid grid-cols-[48px_1fr]">
			<span class="text-success-9">✓</span>
			<span class="text-left">Synchronization problems with system settings</span>
		</div>
	</div>
</div>

<p>
	Do you have an even better way? I'd love it hear it! Share it in the
	<a href="{GH_ROOT}/discussions" data-external>GitHub discussions</a>
	!
</p>
