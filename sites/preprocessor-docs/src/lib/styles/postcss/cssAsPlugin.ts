import fs from 'fs';
import postcss from 'postcss';
import { objectify } from 'postcss-js';
import type { PluginCreator } from 'tailwindcss/types/config';

/**
 * We do it this way to enable tailwind intellisense.
 * See https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1462034856
 */
const buildPluginCreator =
	(cssFilePath: string): PluginCreator =>
	({ addBase, addComponents, addUtilities }) => {
		const css = fs.readFileSync(cssFilePath, 'utf8');
		const root = postcss.parse(css);
		const jss = objectify(root);

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

// these are relative to the file which imports them (tailwindConfig.ts)
export const componentPaths = ['btn', 'features', 'link', 'steps'].map((p) => `./postcss/components/${p}.css`);
export const utilityPaths = ['underline', 'utils'].map((p) => `./postcss/utilities/${p}.css`);
