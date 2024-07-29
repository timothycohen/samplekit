import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { parse } from 'svelte/compiler';

/**
 * @typedef {Object} Logger
 * @property {(detail: { skip: number }, filename: string) => void} [debug]
 * @property {(detail: { count: number }, filename: string) => void} [info]
 */

/**
 * @param {function(string): string} [formatFilename] - Function to format the filename (optional).
 * @returns {Logger} Logger object with debug and info methods.
 */
export const createExternalLinkLogger = (formatFilename = (filename) => filename) => {
	return {
		debug: (detail, filename) =>
			console.debug(`[PREPROCESS] | Anchor | Debug | ${formatFilename(filename)} | skip: ${detail.skip}`),
		info: (detail, filename) =>
			console.info(`[PREPROCESS] | Anchor | Info | ${formatFilename(filename)} | count: ${detail.count}`),
	};
};

/**
 * Adds `target="_blank"` and `rel="noreferrer noopener"` to external links if those attributes are not already present.
 *
 * A link is external if it starts with `tel:`, `mailto:`, `http:`, or `https:`.
 *
 * Note: make sure to run vitePreprocess before this preprocessor.
 *
 * Limitations: this preprocessor ignores dynamic hrefs. href="https://example.com/" is processed, but href="{url}" and href="mailto:{email}" are not.
 *
 * @param {Object} options
 * @param {Logger} [options.logger]
 * @param {(filename: string) => boolean} [options.include]
 *
 * @returns {import('svelte/compiler').PreprocessorGroup}
 */
export function preprocessExternalLinks({ include, logger } = {}) {
	return {
		name: 'external-links',
		markup({ content, filename }) {
			if (!filename) return { code: content };
			if (include && !include(filename)) return { code: content };
			const s = new MagicString(content);
			const ast = parse(content, { filename, modern: true });
			let count = 0;
			let skip = 0;

			// @ts-expect-error – estree / svelte mismatch
			walk(ast.fragment, {
				/** @param {import('svelte/compiler').SvelteNode} node */
				enter(node) {
					if (node.type !== 'RegularElement' || node.name !== 'a') return;

					const hasTarget = node.attributes.some((attr) => attr.type === 'Attribute' && attr.name === 'target');
					const hasRel = node.attributes.some((attr) => attr.type === 'Attribute' && attr.name === 'rel');
					if (hasTarget && hasRel) return;

					/** @type {import('svelte/compiler').Attribute} */
					// @ts-expect-error - returns Attribute
					const href = node.attributes.find((attr) => attr.type === 'Attribute' && attr.name === 'href');
					if (!href || href.value === true || !href.value[0]) {
						skip++;
						return;
					}

					if (href.value.length > 1) {
						// ignoring dynamic hrefs
						skip++;
						return;
					}

					const val = href.value[0];

					if (val.type === 'Text') {
						const hrefVal = val.raw;
						if (
							!hrefVal.startsWith('https:') &&
							!hrefVal.startsWith('http:') &&
							!hrefVal.startsWith('mailto:') &&
							!hrefVal.startsWith('tel:')
						)
							return;

						let newAttrs = '';
						if (!hasTarget) newAttrs += ' target="_blank"';
						if (!hasRel) newAttrs += ' rel="noreferrer noopener"';

						if (newAttrs) {
							count++;
							s.appendRight(val.end + 1, newAttrs);
						}
					} else {
						// ignoring ExpressionTag
						skip++;
					}
				},
			});

			if (skip) logger?.debug?.({ skip }, filename);
			if (count) logger?.info?.({ count }, filename);

			return { code: s.toString() };
		},
	};
}
