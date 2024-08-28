import { defineCtx } from '$lib/utils/client';
import type { ThemeController } from '$lib/styles';

const [get, set] = defineCtx<{ name: string; href: string }>();

const createCodeThemeCtx = (themeController: ThemeController) => {
	const cssVarToThemeName = {
		daffodil: {
			name: 'Rosé Pine Dawn',
			href: 'https://marketplace.visualstudio.com/items?itemName=mvllow.rose-pine',
		},
		amethyst: { name: 'Darker', href: 'https://github.com/timothycohen/darker-theme' },
		desert: { name: 'Darker', href: 'https://github.com/timothycohen/darker-theme' },
		bellflower: {
			name: 'catppuccin-latte',
			href: 'https://marketplace.visualstudio.com/items?itemName=Siris01.catppuccin-theme',
		},
	};
	const codeTheme = $derived(cssVarToThemeName[themeController.theme]);

	set({
		get href() {
			return codeTheme.href;
		},
		get name() {
			return codeTheme.name;
		},
	});
};

const useCodeThemeCtx = get;

export { createCodeThemeCtx, useCodeThemeCtx };
