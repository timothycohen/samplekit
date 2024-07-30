import fs from 'fs';
import postcss from 'postcss';
import postcssJs from 'postcss-js';
import type { PluginCreator } from 'tailwindcss/types/config';

/**
 * Three ways to load utilities and components, from most to least direct. The first two, however, do not enable tailwind css intellisense.
 *
 * 1) Write css or tailwind in `foo.css`, `@import foo.css` into `app.css` and then `import '../app.css';` into root `+layout.svelte`.
 *
 * 2) Use `postcssJs.objectify` to transpile `css` files, create a `themePlugin` with `tailwindcss/plugin`, and add the plugin to `tailwind.config.ts` `Config.plugins`.
 * This can be nice because you can write some `css` and some `jsInCss`, making it easier to use loops and variables when needed.
 * ```ts
 * const cssToJs = async (cssFilePath: string) => {
 * 	try {
 * 		const css = fs.readFileSync(cssFilePath, 'utf8');
 * 		const root = postcss.parse(css);
 * 		return postcssJs.objectify(root);
 * 	} catch (error) {
 * 		console.error('Error processing CSS:', error);
 * 		return {};
 * 	}
 * };
 *
 * export const themePlugin: { handler: PluginCreator } = plugin(async ({ addComponents, addUtilities }) => {
 * 	addComponents(await Promise.all(componentPaths.map(cssToJs)));
 * 	addUtilities(await Promise.all(utilityPaths.map(cssToJs)));
 * });
 * ```
 *
 * 3) Create a function wrapper (`buildPluginCreator`) that curries the `cssFilePath` to a function implementing `PluginCreator`, and instead of calling `...componentPaths.map(buildPluginCreator)`
 * in `tailwind.config.ts` directly, overload `require.extensions['.css']` and call `...componentPaths.map(require)`. This will provide tailwind intellisense.
 *
 * See https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1462034856 for more info.
 *
 */
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

// these are relative to the file which imports them (tailwindConfig.ts)
export const componentPaths = ['alert', 'btn', 'input', 'link', 'modal', 'radio', 'swap-flip', 'typography'].map(
	(p) => `./postcss/components/${p}.css`,
);
export const utilityPaths = ['underline'].map((p) => `./postcss/utilities/${p}.css`);
