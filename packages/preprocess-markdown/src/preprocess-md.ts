import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { marked as hostedMarked } from 'marked';
import { parse, type SvelteNode, type PreprocessorGroup } from 'svelte/compiler';
import type { Logger } from './logger.js';

const delimiter = { start: 'md-start', end: 'md-end' };
const delimLoc = { start: delimiter.start.length + 1, end: -delimiter.end.length - 1 };

/**
 * A simple wrapper around marked to convert Markdown inside an HTML comment into HTML.
 *
 * from
 *
 * ```html
 * <!-- md-start
 * | Header 1 | Header 2 |
 * | -------- | -------- |
 * | Cell 1-1 | Cell 1-2 |
 * | Cell 2-1 | Cell 2-2 |
 * md-end -->
 * ```
 *
 * into
 *
 * ```html
 * <table>
 *   <thead>
 *     <tr>
 *       <th>Header 1</th>
 *       <th>Header 2</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Cell 1-1</td>
 *       <td>Cell 1-2</td>
 *     </tr>
 *     <tr>
 *       <td>Cell 2-1</td>
 *       <td>Cell 2-2</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 */
export function processMarkdown({
	include,
	logger,
	marked = hostedMarked,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
	marked?: typeof hostedMarked;
} = {}) {
	return {
		name: 'md',
		markup({ content, filename }) {
			if (!filename) return;
			if (include && !include(filename)) return;

			try {
				const s = new MagicString(content);
				const ast = parse(content, { filename, modern: true });
				let count = 0;

				walk(ast.fragment, {
					enter(node: SvelteNode) {
						if (node.type !== 'Comment') return;
						const trimmed = node.data.trim();
						if (!trimmed.startsWith(delimiter.start)) return;
						if (!trimmed.endsWith(delimiter.end)) return;
						s.remove(node.start, node.end);
						s.appendLeft(node.start, marked(trimmed.slice(delimLoc.start, delimLoc.end), { async: false }) as string);
						count++;
					},
				});

				if (count) logger?.info?.({ count }, filename);
				return { code: s.toString() };
			} catch (err) {
				if (err instanceof Error) logger?.error?.(err, filename);
				else logger?.error?.(Error('Failed to render Markdown.'), filename);
			}
		},
	} satisfies PreprocessorGroup;
}
