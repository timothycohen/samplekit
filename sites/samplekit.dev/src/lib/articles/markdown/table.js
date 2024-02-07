// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { marked } from 'marked';

/**
 * Preprocess .svx markdown table block into html
 *
 * from
 *
 * ```md
 * <!-- table-start -->
 * | Header 1 | Header 2 |
 * | -------- | -------- |
 * | Cell 1-1 | Cell 1-2 |
 * | Cell 2-1 | Cell 2-2 |
 * <!-- table-end -->
 * ```
 *
 * into
 *
 * ```html
 * <div class="table-wrapper">
 *   <table>
 *     <thead>
 *       <tr>
 *         <th>Header 1</th>
 *         <th>Header 2</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr>
 *         <td>Cell 1-1</td>
 *         <td>Cell 1-2</td>
 *       </tr>
 *       <tr>
 *         <td>Cell 2-1</td>
 *         <td>Cell 2-2</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 * ```
 *
 * @param {Object} logger
 * @param {(message: string) => void} logger.debug
 * @param {(message: string) => void} logger.error
 * @param {(message: string) => void} logger.warn
 * @param {(filename: string) => boolean} include
 */
export function preprocessTable(logger, include) {
	return {
		markup({ content, filename }) {
			if (include && !include(filename)) return null;
			const slug = (() => {
				const a = filename.split('/');
				return a[a.length - 2];
			})();

			const startMarker = '<!-- table-start -->';
			const endMarker = '<!-- table-end -->';

			let resultContent = content;
			let startIdx = resultContent.indexOf(startMarker);

			let count = 0;

			while (startIdx !== -1) {
				count++;

				const endIdx = resultContent.indexOf(endMarker, startIdx + startMarker.length);

				if (endIdx === -1) {
					logger?.error(
						`[PREPROCESS] | ${slug} | Tables | Error | Incomplete md at start ${startIdx} (count: ${count}). Aborting.`,
					);
					return { code: resultContent };
				}

				const extractedContent = resultContent.substring(startIdx + startMarker.length, endIdx);

				const before = resultContent.substring(0, startIdx);
				const processedContent = mdTableToRawHtml(extractedContent);
				const after = resultContent.substring(endIdx + endMarker.length);

				resultContent = before + processedContent + after;

				startIdx = resultContent.indexOf(startMarker, startIdx + processedContent.length);
			}

			logger?.debug(`[PREPROCESS] | ${slug} | Tables | Success | { count: ${count} } }`);

			return { code: resultContent };
		},
	};
}

const mdTableToRawHtml = (rawMarkdown) => {
	const tableHTML = marked(rawMarkdown, { sanitize: true });
	return `<div class="table-wrapper">${tableHTML}</div>`;
};
