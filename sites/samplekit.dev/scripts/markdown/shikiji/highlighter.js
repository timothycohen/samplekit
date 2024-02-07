// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { join } from 'path';
import { loadTheme } from 'shiki';
import { getHighlighterCore, getWasmInlined } from 'shikiji';

/**
 * Returns code with curly braces and backticks replaced by HTML entity equivalents
 * @param {string} html - highlighted HTML
 * @returns {string} - escaped HTML
 */
function escapeHtml(code) {
	return code.replace(/[{}`]/g, (character) => ({ '{': '&lbrace;', '}': '&rbrace;', '`': '&grave;' })[character]);
}

// Hack to avoid Svelte for VS Code throwing an ENOENT error
// process.cwd() for mdsvex.config.js: .../samplekit.git/main/sites/samplekit.dev
// process.cwd() for Svelte for VS Code Extension (workspace root): .../samplekit.git/main
const darkerPath = (() => {
	const cwd = process.cwd();
	if (cwd.includes('samplekit.dev')) {
		return join(cwd, './scripts/markdown/shikiji/darker.json');
	} else {
		return join(cwd, './sites/samplekit.dev/scripts/markdown/shikiji/darker.json');
	}
})();

const shikiji = await getHighlighterCore({
	themes: [await loadTheme(darkerPath), import('shikiji/themes/rose-pine-dawn.mjs')],
	langs: ['json', 'shellscript', 'html', 'css', 'markdown', 'javascript', 'typescript', 'svelte', 'diff'].map(
		(lang) => import(`shikiji/langs/${lang}.mjs`),
	),
	loadWasm: getWasmInlined,
});

export const highlight = {
	async highlighter(code, lang) {
		const highlightLines = [];
		code = code.replace(/^\/\/\/\s*highlight:(.*)\s*\n/m, (_, group) => {
			/** @type {string} */ (group)
				.trim()
				.split(',')
				.forEach((lineStr) => {
					lineStr = lineStr.trim().replace(/[^0-9-]/g, '');
					if (lineStr.includes('-')) {
						const [start, end] = lineStr.split('-');
						for (let line = Number(start.trim()); line <= Number(end.trim()); line++) {
							highlightLines.push(line);
						}
					} else {
						highlightLines.push(Number(lineStr));
					}
				});
			return '';
		});

		let title = '';
		code = code.replace(/^\/\/\/\s*title:(.*)\s*\n/m, (_, group) => {
			title = group;
			return '';
		});

		let copy = false;
		code = code.replace(/^\/\/\/\s*copy:(.*)\s*\n/m, () => {
			copy = true;
			return '';
		});

		const process = (scheme) =>
			shikiji.codeToHtml(code, {
				lang,
				theme: scheme === 'light' ? 'rose-pine-dawn' : 'darker',
				transformers: [
					{
						line(node, line) {
							if (node.tagName === 'pre') {
								node.properties['data-lang'] = lang;
								node.properties['data-theme'] = 'dark';
								if (title) node.properties['data-title'] = title;
							}

							node.properties.class = node.properties.class?.replace('line', '');

							node.properties['data-line'] = line;

							if (highlightLines.includes(line)) {
								node.properties['data-line-highlighted'] = true;
							}
						},
						pre(node) {
							delete node.properties.tabindex;
							node.properties.class = node.properties.class?.replace('shiki ', '');
							node.properties[`data-${scheme}`] = '';
						},
					},
				],
			});
		const light = process('light');
		const dark = process('dark');

		let wrapper =
			`<div class="md-code-wrapper" ${copy ? 'data-copy' : ''} data-title="${title}" data-lang="${lang}">` +
			escapeHtml(light) +
			escapeHtml(dark) +
			'</div>';

		if (title || copy) {
			wrapper =
				`<div class="md-code-topper">${title ? `<span>${title}</span>` : ''}${
					copy
						? '<button class="copy"><span class="sr-only">Copy</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg></button>'
						: ''
				}</div>` + wrapper;
		}

		return wrapper;
	},
};
