// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import shiki, { getHighlighter } from 'shiki';
import darkerJSON from './darker.json' assert { type: 'json' };

const mdLanguages = ['json', 'sh', 'html', 'css', 'md', 'js', 'ts', 'svelte', 'diff'];

const escapeSvelte = (code) => {
	return code.replace(
		/[{}`]|&amp;tripgrave;|&amp;tripslash;/g,
		(character) =>
			({
				'{': '&lbrace;',
				'}': '&rbrace;',
				'`': '&grave;',
				'&amp;tripgrave;': '&grave;&grave;&grave;',
				'&amp;tripslash;': '///',
			})[character],
	);
};

const getHighlightLines = (rawCode) => {
	const highlightLines = [];
	const strippedCode = rawCode.replaceAll('\t', '  ').replace(/^\/\/\/\s*highlight:(.*)\s*\n/m, (_, group) => {
		group
			.trim()
			.split(',')
			.forEach((lineStr) => {
				lineStr = lineStr.trim().replace(/[^0-9-]/g, '');
				if (lineStr.includes('-')) {
					const [start, end] = lineStr.split('-');
					if (start && end) {
						for (let lineNum = Number(start.trim()); lineNum <= Number(end.trim()); lineNum++) {
							highlightLines.push(lineNum);
						}
					}
				} else {
					highlightLines.push(Number(lineStr));
				}
			});
		return '';
	});

	return { strippedCode, highlightLines };
};

const highlighter = await getHighlighter({ themes: ['rose-pine-dawn'], langs: mdLanguages });
await highlighter.loadTheme(darkerJSON);

const createThemedCodeHtml = ({ scheme, theme, code, lang, highlightLines }) => {
	const tokens = highlighter.codeToThemedTokens(code, lang, theme);

	return shiki.renderToHtml(tokens, {
		elements: {
			pre({ children }) {
				return `<pre data-${scheme} class="${theme}">${children}</pre>`;
			},

			code({ children }) {
				return `<code>${children}</code>`;
			},

			line({ children, index }) {
				const dataLine = `data-line="${index + 1}"`;
				const dataHighlight = highlightLines?.includes(index + 1) ? `data-line-highlighted` : '';

				return `<span ${dataLine} ${dataHighlight}>${children}</span>`;
			},

			token({ style, children }) {
				return `<span style="${style}">${children}</span>`;
			},
		},
	});
};

const parseAndRemoveWrapper = (rawMarkdown) => {
	rawMarkdown = rawMarkdown.trim();
	const lines = rawMarkdown.split('\n');
	if (!lines.length) return { error: new Error('Markdown file is empty') };

	const startsWith = lines[0].startsWith('```') ? '```' : lines[0].startsWith('~~~') ? '~~~' : null;
	if (!startsWith) return { error: new Error('Markdown file is not a codeblock') };

	let lang;
	if (startsWith === '```') {
		lang = lines[0].replace('```', '').trim();
		lines.splice(0, 1);
	} else if (startsWith === '~~~') {
		lang = lines[0].replace('~~~', '').trim();
		lines.splice(0, 1);
	}
	if (!mdLanguages.includes(lang)) return { error: new Error(`Language ${lang} not loaded.`) };

	while (lines.length) {
		const lastLine = lines[lines.length - 1].trim();
		if (lastLine === '' || lastLine === startsWith) lines.pop();
		else break;
	}

	const rawCode = lines.join('\n');
	return { rawCode, lang };
};

/**
 *
 * Markdown must be composed as
 *
 * \`\`\`lang
 *
 * content
 *
 * \`\`\`
 *
 *
 * Optionally, to highlight specific lines you can write (0 or 1 times per codeblock):
 *
 * ///highlight:1-2
 *
 * or
 *
 * ///highlight:2,4-10
 */
export const mdCodeBlockToRawHtml = ({ rawCode, lang }) => {
	try {
		const { strippedCode: code, highlightLines } = getHighlightLines(rawCode);
		const light = createThemedCodeHtml({ code, lang, highlightLines, scheme: 'light', theme: 'rose-pine-dawn' });
		const dark = createThemedCodeHtml({ code, lang, highlightLines, scheme: 'dark', theme: 'darker' });
		return { data: `<div class="code-wrapper">` + escapeSvelte(light) + escapeSvelte(dark) + '</div>' };
	} catch (err) {
		return { error: new Error(`Unable to highlight | ${err.message}`) };
	}
};

/**
 * Preprocess .svx markdown code block into html
 *
 * from
 *
 * \`\`\`ts
 *
 * console.log('hello world');
 *
 * \`\`\`
 *
 * into
 *
 * ```html
 * <div class="code-wrapper">
 * 	<pre data-light="" class="rose-pine-dawn">
 * 		<code>
 * 			<span data-line="1">
 * 				<span style="color: #575279; font-style: italic">console</span>
 * 				<span style="color: #286983">.</span>
 * 				<span style="color: #D7827E">log</span>
 * 				<span style="color: #575279">(</span>
 * 				<span style="color: #EA9D34">'hello world'</span>
 * 				<span style="color: #575279">)</span>
 * 				<span style="color: #797593">;</span>
 * 			</span>
 * 		</code>
 * 	</pre>
 * 	<pre data-dark="" class="darker">
 * 		<code>
 * 			<span data-line="1">
 * 				<span style="color: #9CDCFE">console</span>
 * 				<span style="color: #D4D4D4">.</span>
 * 				<span style="color: #DCDCAA">log</span>
 * 				<span style="color: #D4D4D4">(</span>
 * 				<span style="color: #CE9178">'hello world'</span>
 * 				<span style="color: #D4D4D4">);</span>
 * 			</span>
 * 		</code>
 * 	</pre>
 * </div>
 * ```
 *
 * @param {Object} logger
 * @param {(message: string) => void} logger.debug
 * @param {(message: string) => void} logger.error
 * @param {(message: string) => void} logger.warn
 * @param {(filename: string) => boolean} include
 */
export function preprocessCodeblock(logger, include) {
	return {
		markup({ content, filename }) {
			if (include && !include(filename)) return null;
			const slug = (() => {
				const a = filename.split('/');
				return a[a.length - 2];
			})();

			const delimiters = [
				{ startRegex: new RegExp('```(' + mdLanguages.join('|') + ')'), endMarker: '```' },
				{ startRegex: new RegExp('~~~(' + mdLanguages.join('|') + ')'), endMarker: '~~~' },
			];

			let resultContent = content;
			let { startRegex, endMarker } = delimiters.pop();
			let startMatch = startRegex.exec(resultContent);

			let count = 0;

			while (startMatch || delimiters.length) {
				if (!startMatch) {
					({ startRegex, endMarker } = delimiters.pop());
					startMatch = startRegex.exec(resultContent);
					continue;
				}

				count++;

				const startIdx = startMatch.index;
				const endIdx = resultContent.indexOf(endMarker, startIdx + startMatch[0].length);

				if (endIdx === -1) {
					logger?.error(
						`[PREPROCESS] | ${slug} | Codeblock | Error | Incomplete md at start ${startIdx} (count: ${count}). Aborting.`,
					);
					return { code: resultContent };
				}

				const before = resultContent.substring(0, startIdx);
				const extractedContentWithWrapper = resultContent.substring(startIdx, endIdx + endMarker.length);
				const after = resultContent.substring(endIdx + endMarker.length);
				let processedContent = '';

				const { rawCode, lang, error: codeProcessError } = parseAndRemoveWrapper(extractedContentWithWrapper);
				let highlightError;
				if (!codeProcessError) {
					const { data, error } = mdCodeBlockToRawHtml({ rawCode, lang });
					if (data) processedContent = data;
					else if (error) highlightError = error;
				}

				if (codeProcessError || highlightError) {
					logger?.warn(
						`[PREPROCESS] | ${slug} | Codeblock | Warning | Unable to process at start ${startIdx} count ${count}. Skipping.`,
					);
				}

				resultContent = before + processedContent + after;
				startMatch = startRegex.exec(resultContent);
			}

			logger?.debug(`[PREPROCESS] | ${slug} | Codeblock | Success | { count: ${count} } }`);

			return { code: resultContent };
		},
	};
}
