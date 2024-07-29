import { getOrLoadOpts } from '@samplekit/preprocess-shiki';

const opts = await getOrLoadOpts({
	highlighter: {
		lang: { bundled: ['svelte', 'json', 'sh'] },
		theme: { bundled: ['rose-pine-dawn', 'catppuccin-latte'] },
		cssVarToThemeName: { daffodil: 'rose-pine-dawn', dark: 'darker', bellflower: 'catppuccin-latte' },
	},
});

export { opts };
