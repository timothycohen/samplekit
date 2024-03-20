import { getHighlighter, type BundledLanguage as ShikiLang } from 'shiki';
import darkerJSON from './darker.js';
import type { Element } from 'hast';

export const mdLanguages = ['json', 'sh', 'html', 'css', 'md', 'js', 'ts', 'svelte', 'diff'] satisfies ShikiLang[];
export type MdLang = (typeof mdLanguages)[number];
export const isMdLang = (lang?: string): lang is MdLang => mdLanguages.includes(lang as MdLang);

const escapePreprocessor = (code: string) => {
	return code.replace(/&tripgrave;|&tripslash;|&triptilde;|&brackbang;/g, (match) => {
		return {
			'&tripgrave;': '```',
			'&tripslash;': '///',
			'&triptilde;': '~~~',
			'&brackbang;': '[!',
		}[match]!;
	});
};

const escapeSvelte = (code: string) => {
	return code.replace(/[{}`]/g, (match) => {
		return {
			'{': '&lbrace;',
			'}': '&rbrace;',
			'`': '&grave;',
		}[match]!;
	});
};

const extractGlobalRegex = ({ rawCode, regex }: { rawCode: string; regex: RegExp }) => {
	const lines: number[] = [];
	const strippedCode = rawCode.replace(regex, (_, group) => {
		group
			.trim()
			.split(',')
			.forEach((lineStr: string) => {
				lineStr = lineStr.trim().replace(/[^0-9-]/g, '');
				if (lineStr.includes('-')) {
					const [start, end] = lineStr.split('-');
					if (start && end) {
						for (let lineNum = Number(start.trim()); lineNum <= Number(end.trim()); lineNum++) {
							lines.push(lineNum);
						}
					}
				} else {
					lines.push(Number(lineStr));
				}
			});
		return '';
	});

	return { strippedCode, lines };
};

const propToGlobalRegex = [
	['highlighted', /^\/\/\/\s*highlight:(.*)\s*\n/m, ' // [!highlight]'],
	['hidden', /^\/\/\/\s*hide:(.*)\s*\n/m, ' // [!hide'],
	['diff-added', /^\/\/\/\s*diff-add:(.*)\s*\n/m, ' // [!diff-add'],
	['diff-removed', /^\/\/\/\s*diff-remove:(.*)\s*\n/m, ' // [!diff-remove'],
] as const;

const lineRegexMatchToProp = {
	highlight: 'highlighted',
	hide: 'hidden',
	'diff-add': 'diff-added',
	'diff-remove': 'diff-removed',
} as const;

const lineRegex = /\/\/\s*\[!(highlight|hide|diff-add|diff-remove)\]/g;

const getLineProps = (rawCode: string) => {
	let code = rawCode.replaceAll('\t', '  ');
	const lineProps: Record<number, `data-line-${(typeof propToGlobalRegex)[number][0]}`[]> = {};
	const hasProperty = propToGlobalRegex.reduce(
		(acc, [propName]) => ({ ...acc, [propName]: false }),
		{} as Record<(typeof propToGlobalRegex)[number][0], boolean>,
	);

	for (const [propertyName, globalRegex] of propToGlobalRegex) {
		const { strippedCode, lines } = extractGlobalRegex({ rawCode: code, regex: globalRegex });
		code = strippedCode;
		if (lines.length) hasProperty[propertyName] = true;
		for (const line of lines) {
			if (lineProps[line]) lineProps[line]!.push(`data-line-${propertyName}`);
			else lineProps[line] = [`data-line-${propertyName}`];
		}
	}

	code = code
		.split('\n')
		.map((lineStr, index) => {
			let match;
			const lineNum = index + 1;

			while ((match = lineRegex.exec(lineStr)) !== null) {
				const key = match[1] as keyof typeof lineRegexMatchToProp;
				const propName = lineRegexMatchToProp[key];
				if (lineProps[lineNum]) lineProps[lineNum]!.push(`data-line-${propName}`);
				else lineProps[lineNum] = [`data-line-${propName}`];
			}

			return lineStr.replace(lineRegex, '');
		})
		.join('\n');

	const preProps = Object.entries(hasProperty).reduce((acc, [key, value]) => {
		if (value) acc.push(`data-has-${key}`);
		return acc;
	}, [] as string[]);

	return { strippedCode: code, lineProps, preProps };
};

const highlighter = await getHighlighter({ themes: [darkerJSON, 'rose-pine-dawn'], langs: mdLanguages });

const createThemedCodeHtml = ({
	code,
	lang,
	lineProps,
	preProps,
}: {
	code: string;
	lang: MdLang;
	lineProps: Record<number, string[]>;
	preProps: string[];
}) => {
	let lineNum = 1;

	return highlighter.codeToHtml(code.trim(), {
		lang,
		themes: { darker: 'darker', 'rose-pine-dawn': 'rose-pine-dawn' },
		defaultColor: false,
		cssVariablePrefix: '--h-',
		transformers: [
			{
				line(el: Element) {
					delete el.properties['class'];
					el.properties['data-line'] = lineNum;
					const properties = lineProps[lineNum];
					if (properties?.length) properties.forEach((property) => (el.properties[property] = ''));
					lineNum++;
					return el;
				},
				code(el: Element) {
					// remove hidden lines and collapse the resulting whitespace
					// doing it this way after highlighting means we can still highlight things like class methods without declaring the entire class
					const newChildren = [];
					for (let i = 0; i < el.children.length; i++) {
						const child = el.children[i]!;
						if (child.type !== 'element') {
							newChildren.push(child);
						} else if (!Object.keys(child.properties).includes('data-line-hidden')) {
							newChildren.push(child);
						} else {
							const next = el.children[i + 1];
							if (next?.type === 'text') {
								next.value = next.value.replace(/^\n/, '');
							}
						}
					}
					el.children = newChildren;
					return el;
				},
				pre(el: Element) {
					delete el.properties['class'];
					delete el.properties['tabindex'];
					preProps.forEach((property) => (el.properties[property] = ''));
					return el;
				},
			},
		],
	});
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
export const mdCodeBlockToRawHtml = ({ rawCode, lang }: { rawCode: string; lang: MdLang }) => {
	try {
		const { strippedCode, lineProps, preProps } = getLineProps(rawCode);
		return {
			data:
				`<div class="code-wrapper">` +
				escapeSvelte(createThemedCodeHtml({ code: escapePreprocessor(strippedCode), lang, lineProps, preProps })) +
				'</div>',
		};
	} catch (err) {
		if (err instanceof Error) return { error: err };
		return { error: new Error(`Unable to highlight`) };
	}
};

const parseAndRemoveWrapper = (
	rawMarkdown: string,
): { rawCode: string; lang: MdLang; error?: never } | { rawCode?: never; lang?: never; error: Error } => {
	rawMarkdown = rawMarkdown.trim();
	const lines = rawMarkdown.split('\n');
	const firstLine = lines[0];
	if (!firstLine) return { error: new Error('Markdown file is empty') };

	const startsWith = firstLine.startsWith('```') ? '```' : firstLine.startsWith('~~~') ? '~~~' : null;
	if (!startsWith) return { error: new Error('Markdown file is not a codeblock') };

	let lang: string;
	if (startsWith === '```') {
		lang = firstLine.replace('```', '').trim();
		lines.splice(0, 1);
	} else {
		lang = firstLine.replace('~~~', '').trim();
		lines.splice(0, 1);
	}
	if (!isMdLang(lang)) return { error: new Error(`Language ${lang} not loaded.`) };

	while (lines.length) {
		const lastLine = lines[lines.length - 1]!.trim();
		if (lastLine === '' || lastLine === startsWith) lines.pop();
		else break;
	}

	const rawCode = lines.join('\n');
	return { rawCode, lang };
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
 * 	<pre style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #575279; --h-darker-bg: #000; --h-rose-pine-dawn-bg: #faf4ed; --h-rose-pine-dawn-scroll-thumb: hsl(268.1, 21.5%, 57.1%); --h-rose-pine-dawn-scroll-track: hsl(268.1, 21.5%, 75%); --h-darker-scroll-thumb: hsl(var(--gray-7)); --h-darker-scroll-track: hsl(var(--gray-3));">
 * 		<code>
 * 			<span data-line="1">
 * 				<span style="--h-darker: #9CDCFE; --h-rose-pine-dawn: #575279; --h-darker-font-style: inherit; --h-rose-pine-dawn-font-style: italic;">console</span>
 * 				<span style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #286983;">.</span>
 * 				<span style="--h-darker: #DCDCAA; --h-rose-pine-dawn: #D7827E;">log</span>
 * 				<span style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #575279;">(</span>
 * 				<span style="--h-darker: #CE9178; --h-rose-pine-dawn: #EA9D34;">'hello world'</span>
 * 				<span style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #575279;">)</span>
 * 				<span style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #797593;">;</span>
 * 			</span>
 * 			<span data-line="2" data-line-highlighted>
 * 				<span style="--h-darker: #569CD6; --h-rose-pine-dawn: #286983; --h-darker-font-style: italic; --h-rose-pine-dawn-font-style: inherit;">const</span>
 * 				<span style="--h-darker: #4FC1FF; --h-rose-pine-dawn: #575279; --h-darker-font-style: inherit; --h-rose-pine-dawn-font-style: italic;"> highlightedLine</span>
 * 				<span style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #286983;"> =</span>
 * 				<span style="--h-darker: #569CD6; --h-rose-pine-dawn: #D7827E; --h-darker-font-style: italic; --h-rose-pine-dawn-font-style: inherit;"> true</span>
 * 				<span style="--h-darker: #D4D4D4; --h-rose-pine-dawn: #797593;">;</span>
 * 			</span>
 * 		</code>
 * 	</pre>
 * </div>
 * ```
 * */

export function preprocessCodeblock({
	include,
	logger,
}: {
	logger?: { error: (s: string) => void; debug: (s: string) => void; warn: (s: string) => void };
	include?: (filename: string) => boolean;
} = {}) {
	return {
		markup({ content, filename }: { content: string; filename: string }): { code: string } | null {
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
			let { startRegex, endMarker } = delimiters.pop()!;
			let startMatch = startRegex.exec(resultContent);

			let count = 0;

			while (startMatch || delimiters.length) {
				if (!startMatch) {
					({ startRegex, endMarker } = delimiters.pop()!);
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
				if (rawCode && lang) {
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
