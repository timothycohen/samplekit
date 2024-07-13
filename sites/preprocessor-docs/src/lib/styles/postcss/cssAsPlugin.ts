import fs from 'fs';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
import type { PluginCreator } from 'tailwindcss/types/config';

const buildPluginCreator =
	(cssFilePath: string): PluginCreator =>
	({ addBase, addComponents, addUtilities }) => {
		const css = fs.readFileSync(cssFilePath, 'utf8');
		const root = postcss.parse(css);
		const jss = postcssJs.objectify(root);

		if ('@layer base' in jss) {
			addBase(jss['@layer base']);
		}
		if ('@layer components' in jss) {
			addComponents(jss['@layer components']);
		}
		if ('@layer utilities' in jss) {
			addUtilities(jss['@layer utilities']);
		}
	};

require.extensions['.css'] = function (module, cssFilePath) {
	module.exports = buildPluginCreator(cssFilePath);
};

export const componentPaths = ['alert', 'btn', 'input', 'link', 'modal', 'radio'].map(
	(p) => `./src/lib/styles/postcss/components/${p}.css`,
);

export const utilityPaths = ['underline'].map((p) => `./src/lib/styles/postcss/utilities/${p}.css`);
