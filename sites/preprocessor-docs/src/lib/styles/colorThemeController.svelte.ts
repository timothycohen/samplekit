import { THEMES, getStoredThemeOnClient, setStoredThemeOnClient, setThemeOnDoc, type Theme } from './colorThemeUtils';

export class ThemeController {
	#theme: Theme = $state(getStoredThemeOnClient());

	constructor() {
		$effect(() => {
			setThemeOnDoc(this.#theme);
		});
		$effect(() => {
			setStoredThemeOnClient({ theme: this.#theme });
		});
	}

	get theme() {
		return this.#theme;
	}

	setTheme(value: Theme['name']) {
		const theme = THEMES.find((t) => t.name === value);
		if (!theme) return;
		this.#theme = theme;
	}
}
