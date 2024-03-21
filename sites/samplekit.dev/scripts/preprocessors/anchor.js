import MagicString from 'magic-string';
import { walk, parse } from 'svelte/compiler';

/**
 * @typedef {import('svelte/compiler').PreprocessorGroup} PreprocessorGroup
 * @typedef {import('svelte/compiler').Processed} Processed
 */

/**
 * Adds `target="_blank"` and `rel="noreferrer noopener"` to external links if those attributes are not already present.
 *
 * A link is external if it starts with `tel:`, `mailto:`, `http:`, or `https:`.
 *
 * Make sure to run vitePreprocess before this preprocessor.
 *
 * @param {Object} options
 * @param {(filename: string) => boolean} [options.include]
 * @param {{ error: (s: string) => void; debug: (s: string) => void; warn: (s: string) => void }} [options.logger]
 * @param {(slug: string) => string} [options.formatLogFilename]
 *
 * @returns {PreprocessorGroup}
 */
export function preprocessExternalLinks({ include, logger, formatLogFilename } = {}) {
	/**
	 * @type {PreprocessorGroup}
	 */
	const preprocessor = {
		/**
		 * @param {{ content: string; filename?: string }} params
		 * @returns {Processed}
		 */
		markup({ content, filename }) {
			if (!filename) return { code: content };
			if (include && !include(filename)) return { code: content };

			const s = new MagicString(content);
			const ast = parse(content, { filename });
			/**
			 * @typedef {typeof ast.html} TemplateNode
			 */
			let count = 0;
			let skip = 0;

			// @ts-expect-error - ast.html is a fragment, fine for enter
			walk(ast.html, {
				/**
				 * @param {TemplateNode} node
				 */
				enter(node) {
					if (node.type !== 'Element' || node.name !== 'a') return;

					const hasTarget = node.attributes.some((/** @type {{name: string}} */ attr) => attr.name === 'target');
					const hasRel = node.attributes.some((/** @type {{name: string}} */ attr) => attr.name === 'rel');
					if (hasTarget && hasRel) return;

					const href = node.attributes.find((/** @type {{name: string}} */ attr) => attr.name === 'href');
					if (!href) {
						skip++;
						return;
					}

					const type = href.value?.[0]?.type;
					if (type !== 'Text') {
						// type === 'MustacheTag'
						skip++;
						return;
					}

					const hrefVal = href.value[0].raw;
					if (
						!hrefVal.startsWith('https:') &&
						!hrefVal.startsWith('http:') &&
						!hrefVal.startsWith('mailto:') &&
						!hrefVal.startsWith('tel:')
					)
						return;

					const firstChild = node.children?.[0];
					if (!firstChild) return;

					let newAttrs = '';
					if (!hasTarget) newAttrs += 'target="_blank"';
					if (!hasRel) newAttrs += 'rel="noreferrer noopener"';

					if (newAttrs) {
						count++;
						s.appendLeft(firstChild.start - 1, newAttrs);
					}
				},
			});

			if (logger && (count || skip)) {
				const msg =
					count && skip ? `{ count: ${count}, skip: ${skip} }` : count ? `{ count: ${count} }` : `{ skip: ${skip} }`;
				logger.debug(
					`[PREPROCESS] | ${formatLogFilename ? formatLogFilename(filename) : filename} | Anchor | Success | ${msg}`,
				);
			}

			return { code: s.toString() };
		},
	};

	return preprocessor;
}
