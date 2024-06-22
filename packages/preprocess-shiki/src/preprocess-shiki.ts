import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { getHighlighter, type Highlighter, type BundledLanguage as ShikiLang } from 'shiki';
import { parse, type SvelteNode, type PreprocessorGroup } from 'svelte/compiler';
import darkerJSON from './darker.js';
import type { Element } from 'hast';

// todo make sure this is fully customizable with own highlighter

export const mdLanguages = [
	'json',
	'sh',
	'html',
	'css',
	'md',
	'js',
	'ts',
	'svelte',
	'diff',
	'latex',
	'graphql',
] satisfies ShikiLang[];
export type MdLang = (typeof mdLanguages)[number];
export const isMdLang = (lang?: string): lang is MdLang => mdLanguages.includes(lang as MdLang);

const commonDelimiter = 'shiki-';

const fencedDelimiter = (() => {
	const start = `${commonDelimiter}start`;
	const end = `${commonDelimiter}end`;
	const startLoc = start.length + 1;
	const endLoc = -end.length - 1;
	return { start, end, startLoc, endLoc };
})();

const inlineDelimiters = mdLanguages.map((lang) => {
	const delimiter = `${commonDelimiter}${lang}`;
	const delimLoc = { start: delimiter.length + 1, end: -delimiter.length - 1 };
	return { delimiter, delimLoc, lang };
});

const escapePreprocessor = (code: string) => {
	return code.replace(
		/&tripgrave;|&tripslash;|&triptilde;|&brackbang;|&openhtmlcomment;|&closehtmlcomment;/g,
		(match) => {
			return {
				'&tripgrave;': '```',
				'&tripslash;': '///',
				'&triptilde;': '~~~',
				'&brackbang;': '[!',
				'&openhtmlcomment;': '<!--',
				'&closehtmlcomment;': '-->',
			}[match]!;
		},
	);
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

const defaultHighlighter: Highlighter = await getHighlighter({
	themes: [darkerJSON, 'rose-pine-dawn'],
	langs: mdLanguages,
});

const createThemedCodeHtml = ({
	code,
	lang,
	lineProps,
	preProps,
	codeInline,
	highlighter,
}: {
	code: string;
	lang: MdLang;
	lineProps: Record<number, string[]>;
	preProps: string[];
	codeInline?: true;
	highlighter: Highlighter;
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
					if (codeInline) {
						el.properties['data-inline'] = '';
						el.properties['style'] = 'whitespace: pre;';
					}
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
export const mdCodeBlockToRawHtml = (
	{ rawCode, lang, noWrap }: { rawCode: string; lang: MdLang; noWrap?: true },
	highlighter = defaultHighlighter,
) => {
	try {
		const { strippedCode, lineProps, preProps } = getLineProps(rawCode);

		const raw = escapeSvelte(
			createThemedCodeHtml({ code: escapePreprocessor(strippedCode), lang, lineProps, preProps, highlighter }),
		);
		if (noWrap) return { data: raw };
		return { data: `<div class="code-wrapper">` + raw + `</div>` };
	} catch (err) {
		if (err instanceof Error) return { error: err };
		return { error: new Error(`Unable to highlight`) };
	}
};

export const mdCodeBlockToRawHtmlInline = (
	{ rawCode, lang }: { rawCode: string; lang: MdLang },
	highlighter = defaultHighlighter,
) => {
	try {
		const { strippedCode, lineProps, preProps } = getLineProps(rawCode);
		return {
			data: escapeSvelte(
				createThemedCodeHtml({
					code: escapePreprocessor(strippedCode),
					lang,
					lineProps,
					preProps,
					codeInline: true,
					highlighter,
				}).replace(/^<pre[^>]*>(<code[^>]*>[\s\S]*?<\/code>)<\/pre>$/, '$1'),
			),
		};
	} catch (err) {
		if (err instanceof Error) return { error: err };
		return { error: new Error(`Unable to highlight`) };
	}
};

const removeFence = (
	rawMarkdown: string,
): { data: { rawCode: string; lang: MdLang }; error?: never } | { data?: never; error: Error } => {
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
	return { data: { rawCode, lang } };
};

/**
 * Preprocess markdown code block into html
 *
 * from
 *
 * ~~~html
 * <!-- shiki-start
 * ```ts
 * console.log('hello world');
 * ```
 * shiki-end -->
 * ~~~
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
export function processCodeblock({
	include,
	logger,
	highlighter = defaultHighlighter,
}: {
	include?: (filename: string) => boolean;
	logger?: {
		error?: (s: string) => void;
		debug?: (s: string) => void;
		formatFilename?: (filename: string) => string;
	};
	highlighter?: Highlighter;
} = {}): PreprocessorGroup {
	return {
		name: 'codeblock',
		markup({ content, filename }) {
			if (!filename) return;
			if (include && !include(filename)) return;
			const s = new MagicString(content);
			const ast = parse(content, { filename, modern: true });
			let count = 0;

			walk(ast.fragment, {
				enter(node: SvelteNode) {
					if (node.type !== 'Comment') return;
					const trimmed = node.data.trim();
					if (!trimmed.startsWith(commonDelimiter)) return;

					if (trimmed.endsWith(fencedDelimiter.end)) {
						s.remove(node.start, node.end);

						const fenceRes = removeFence(trimmed.slice(fencedDelimiter.startLoc, fencedDelimiter.endLoc));
						if (fenceRes.error) {
							logger?.error?.(
								`[PREPROCESS] | Code | Error | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${fenceRes.error.message}`,
							);
							return;
						}

						const { error, data } = mdCodeBlockToRawHtml(fenceRes.data, highlighter);
						if (error) {
							logger?.error?.(
								`[PREPROCESS] | Code | Error | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${error.message}`,
							);
							return;
						}

						s.appendLeft(node.start, data);
						count++;
						return;
					}

					for (const { delimLoc, delimiter, lang } of inlineDelimiters) {
						if (trimmed.endsWith(delimiter)) {
							s.remove(node.start, node.end);

							const rawCode = trimmed.slice(delimLoc.start, delimLoc.end);

							const { error, data } = mdCodeBlockToRawHtmlInline({ rawCode, lang }, highlighter);
							if (error) {
								logger?.error?.(
									`[PREPROCESS] | Code | Error | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${error.message}`,
								);
								return;
							}

							s.appendLeft(node.start, data);
							count++;
							break;
						}
					}
				},
			});

			if (logger?.debug && count) {
				const msg = `{ count: ${count} }`;
				logger.debug?.(
					`[PREPROCESS] | Code | Success | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${msg}`,
				);
			}

			return { code: s.toString() };
		},
	};
}
