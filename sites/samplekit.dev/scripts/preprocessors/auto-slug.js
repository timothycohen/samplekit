import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { parse } from 'svelte/compiler';

/**
 * ### Add anchors inside h2, h3, h4, h5, and h6 tags.
 *
 * #### Convert
 * ```html
 * <h4>Setters</h4>
 * ```
 *
 * #### Into
 *
 * ```html
 * <h4 id="setters" data-auto-slug="">
 * 	<a href="#setters" aria-hidden="true" tabindex="-1" data-auto-slug-anchor="">#</a>
 * 	Setters
 * </h4>
 * ```
 *
 * Note: make sure to run vitePreprocess before this preprocessor.
 *
 * @param {Object} options
 * @param {{ debug: (s: string) => void, formatFilename?: (filename: string) => string }} [options.logger]
 * @param {(filename: string) => boolean} [options.include]
 * @param {string[]} [options.tags]
 *
 * @returns {import('svelte/compiler').PreprocessorGroup}
 */
export function addSlugsToHeaders({ include, logger, tags } = {}) {
	return {
		name: 'auto-slug',
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
					if (node.type !== 'RegularElement' || !(tags ?? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).includes(node.name))
						return;

					const children = node.fragment.nodes;
					if (!children) return;
					const firstChild = children[0];
					if (!firstChild || firstChild.type !== 'Text') {
						skip++;
						return;
					}
					const id = firstChild.data.trim().toLowerCase().replace(/\s+/g, '-');
					if (!id) {
						skip++;
						return;
					}

					count++;
					s.appendLeft(firstChild.start - 1, ` id="${id}" data-auto-slug=""`);
					s.appendLeft(
						firstChild.start,
						`<a href="#${id}" aria-hidden="true" tabindex="-1" data-auto-slug-anchor="">#</a>`,
					);
				},
			});

			if (logger && (count || skip)) {
				const msg =
					count && skip ? `{ count: ${count}, skip: ${skip} }` : count ? `{ count: ${count} }` : `{ skip: ${skip} }`;
				logger.debug(
					`[PREPROCESS] | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | Autoslug | Success | ${msg}`,
				);
			}

			return { code: s.toString() };
		},
	};
}
