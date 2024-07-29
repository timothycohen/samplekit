<script lang="ts">
	import { CodeTopper } from '$lib/articles/components';
	import { TabPanelItem } from '$lib/components';
	import DiffProcess from './DiffProcess.svelte';
	import DiffRender from './DiffRender.svelte';
	import DiffWrite from './DiffWrite.svelte';
	import TableProcess from './TableProcess.svelte';
	import TableRender from './TableRender.svelte';
	import TableWrite from './TableWrite.svelte';

	const { data } = $props();

	const svelteConfig = data.article.demos?.main?.find((e) => e.title === 'svelte.config.js')?.rawHTML;
	const tablePreprocessors = data.article.demos?.main?.find((e) => e.title === 'tablePreprocessor.ts')?.rawHTML;
	const codeBlocks = data.codeBlockCss;
	if (!svelteConfig || !tablePreprocessors || !codeBlocks) throw new Error('Missing data');
</script>

<p>When creating this website, I had a few DX requirements:</p>

<ul>
	<li class="list-disc">easily embed Svelte components within the article</li>
	<li class="list-disc">write code blocks and tables in Markdown</li>
	<li class="list-disc">style code blocks with my personal VS Code theme</li>
	<li class="list-disc">transform everything on the server (no client-side highlighting)</li>
	<li class="list-disc">easily customize and extends features</li>
	<li class="list-disc">not have to wait for compatibility when Svelte 5 is released</li>
</ul>

<h2>Evaluating the Options</h2>

<h3>0.1: Unified</h3>

<p>
	Unified is an ecosystem of packages that all accept a standardized abstract syntax tree (AST). The uniformity means
	you can convert your language into an AST, run a pipeline of transformations, and then transform it into some other
	language. Originally, I thought of using the unified ecosystem to convert Markdown to an AST, use <code
		>rehypePrettyCode</code
	> in the middle for styling, and then convert it to HTML. This is a great solution for technical and non-technical users
	alike because of how easy Markdown is to write.
</p>

<p>Something like this would work:</p>

<CodeTopper title="Unified Markdown Parser">
	<!-- shiki-start
```ts
// https://github.com/syntax-tree/unist#list-of-utilities unified AST utilities
// https://github.com/syntax-tree/mdast#list-of-utilities markdown AST utilities
// https://github.com/syntax-tree/hast#list-of-utilities html AST utilities
// https://github.com/remarkjs/remark/blob/main/doc/plugins.md remark: markdown AST plugins
// https://github.com/rehypejs/rehype/blob/main/doc/plugins.md rehype: html AST plugins

import matter from 'gray-matter';
import { rehypeAddCopyBtnToCodeTitle, remarkReadingTime, type RemarkReadingTimeData } from './plugins.js';
import fs from 'fs/promises';
import path from 'path';
import rehypeCodeTitles from 'rehype-code-titles';
import { default as rehypePrettyCode, type Theme } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkSmartypants from 'remark-smartypants';
import remarkTableOfContents from 'remark-toc';
import { unified } from 'unified';
import { darker } from './code-themes/darker.js';
import type { Parsed } from './types.js';

type PluginData = RemarkReadingTimeData;

/** @throws Error */
export const mdToHTML = async <T extends object>(markdown: string) => {
	const split = matter(markdown);
	const rawMd = split.content;
	const frontMatter = split.data as T;

	const result = await unified()
		.use(remarkParse) // Convert Markdown string to Markdown AST
		.use(remarkGfm) // Use GitHub flavored Markdown
		.use(remarkSmartypants) // Convert ASCII to Unicode punctuation: “ ” – — …
		.use([[remarkTableOfContents, { tight: true }]]) // Generate TOC list from headings (tight removes <p> from <li> when nested)
		.use(remarkReadingTime) // Add reading time to result.data
		.use(remarkRehype) // Convert Markdown AST to HTML AST
		.use(rehypeSlug) // Add IDs to headings
		.use(rehypeCodeTitles) // Add titles to code blocks
		.use(rehypePrettyCode, { theme: { light: 'rose-pine-dawn', dark: darker as unknown as Theme } }) // Add code syntax, line/word highlighting, line numbers
		.use(rehypeAddCopyBtnToCodeTitle) // Add copy button to code blocks
		.use(rehypeStringify) // Convert HTML AST to HTML string
		.process(rawMd);

	const pluginData = result.data as PluginData;
	const readingTime = Math.ceil(pluginData.readingTime.minutes);

	return {
		rawHTML: result.value as string,
		data: { ...frontMatter, readingTime },
	};
};

/** @throws Error if the file could not be read or parsed */
export async function parsePath<T extends object>(mdPath: { slug: string; path: string }): Promise<Parsed<T>> {
	const rawMdContent = await fs.readFile(mdPath.path, 'utf-8').catch((_err) => {
		throw new Error(`Unable to readFile ${mdPath.path}`);
	});
	return await mdToHTML<T>(rawMdContent).catch((_err) => {
		throw new Error(`Unable to parse ${mdPath.slug}`);
	});
}

/** @throws fs.readdir Error */
export async function parseDir<T extends object>(inDir: string): Promise<Parsed<T>[]> {
	const mdPaths = (await fs.readdir(inDir, { withFileTypes: true })).map((dirent) => ({
		slug: dirent.name,
		path: path.join(dirent.path, dirent.name, `${dirent.name}.md`),
	}));

	const res = await Promise.all(
		mdPaths.map(async (p) => {
			try {
				return await parsePath<T>(p);
			} catch (err) {
				console.error(`\n${(err as Error).message}`);
				return null;
			}
		}),
	);
	return res.filter((r) => r !== null) as Parsed<T>[];
}
```
shiki-end -->
</CodeTopper>

<p>
	However, this makes inlining Svelte components cumbersome. Would we write multiple md files, import/process them
	separately, and put the Svelte components in-between? Would we have some special syntax to inject the Svelte
	components where needed?
</p>

<h3>0.2: MDsveX</h3>
<p>
	<a href="https://MDsveX.pngwn.io/docs/">MDsveX</a> – a Markdown preprocessor for Svelte – solves the embedded Svelte
	problem.
	<a href="https://kit.svelte.dev/docs/integrations#preprocessors">Preprocessors</a> transform the input files before passing
	them to the Svelte compiler, and this particular preprocessor enables writing Markdown and Svelte in the same file.
</p>

<p>
	The biggest concern at the time of my decision was that it hadn't been updated in 7 months with over 150+ open issues.
	It didn't inspire confidence that it would support Svelte 5 upon its release, which was a large consideration of which
	method to use. The second reason was that MDsveX was overkill for my needs. I want to keep my code as close to HTML as
	possible because it's more expressive and simpler; every step away from HTML is another build process.
</p>

<p>
	I really only want Markdown for two things: tables and code blocks. The general idea of a preprocessor, however, is
	very appealing.
</p>

<h3>0.3: Preprocessors</h3>

<p>
	We can easily customize our supported functionality by writing simple preprocessors for each feature we want to add.
	There are plenty of packages which could handle our desired functionality so we only need to write functions that wrap
	a dedicated package and call it when some special syntax is detected.
</p>

<h2>Integrating Preprocessors</h2>

<h3>Setup</h3>

<p>
	First, we'll want a different file extension so that we can instruct our preprocessors to not waste time on regular
	<code>.svelte</code> files. It will also make it easier to write invalid Svelte syntax without triggering lint errors.
	<a href="https://github.com/sveltejs/svelte/issues/9039#issuecomment-1650599142">
		(&lt;script&gt; tags in HTML are especially troublesome.)
	</a>
	Using <code>.svx</code> (the extension used by MDsveX) is natural because our preprocessor syntax will be trivially
	different from a subset of their syntax and would allow us to switch easily if desired. It also comes with the benefit
	of a (limited)
	<a href="https://marketplace.visualstudio.com/items?itemName=sebsojeda.vscode-svx">
		VS Code syntax highlighting extension
	</a>.
</p>

<p>Now that we've chosen the file extension, we'll need to configure vite to look for it.</p>

<CodeTopper title="vite.config.ts">
	<!-- shiki-start
```ts
import type { UserConfig } from 'vite';

export default {
	...,
	assetsInclude: '**/*.svx',
} satisfies UserConfig;
```
shiki-end -->
</CodeTopper>

<p>We'll add types to our <code>app.d.ts</code> file to remove the lint errors.</p>

<CodeTopper title="app.d.ts">
	<!-- shiki-start
```ts
declare global {
	...

	module '*.svx' {
		const component: import('svelte').ComponentType<import('svelte').SvelteComponent>;
		export default component;
	}
}
export {};
```
shiki-end -->
</CodeTopper>

<p>And finally we add the preprocessors.</p>

<CodeTopper title="svelte.config.js">
	<TabPanelItem panel={{ rawHTML: svelteConfig }} />
</CodeTopper>

<p>
	<code>vitePreprocess</code> from <code>vite-plugin-svelte</code> handles the regular transformations like
	<code>&ltscript lang="ts"&gt</code>.
</p>

<div class="alert-wrapper alert-wrapper-info pb-2 text-base">
	<p class="alert-header my-0">Tip</p>
	<p class="mb-6 mt-2">Add emmet completions for <code>.svx</code> files in VS Code for your sanity!</p>
	<div class="text-lg">
		<CodeTopper title=".vscode/settings.json">
			<!-- shiki-start
```json
{
	"emmet.includeLanguages": { ..., "svx": "html" }
}
```
shiki-end -->
		</CodeTopper>
	</div>
</div>

<h3>Table Preprocessor</h3>

<h4>Transformation Pipeline</h4>

<p>We want to write:</p>

<CodeTopper title="Table Example: Writing">
	<TableWrite />
</CodeTopper>

<p>process to (sans whitespace):</p>

<CodeTopper title="Table Example: Processing">
	<TableProcess />
</CodeTopper>

<p>and render as:</p>

<TableRender />

<div class="alert-wrapper alert-wrapper-info text-base">
	<p class="alert-header my-0">Hint</p>
	<p class="my-2">Styles via <a href="https://tailwindcss.com/docs/typography-plugin">Tailwind Typography</a>.</p>
</div>

<p>
	We <span class="italic">could</span> write some complicated logic to parse the file and determine where a table might start
	or end, but let's just make it very simple and use a start and end tag.
</p>

<p>
	Comment syntax is nice because it disappears if changing to MDsveX, has a bound keyboard shortcut, and has noticeable
	syntax highlighting.
</p>

<h4>Writing the Preprocessor</h4>

<p>
	We know what we want, so let's write a simple preprocessor that wraps a dedicated package. There are multiple packages
	we could use to handle the heavy lifting of converting a Markdown table into HTML. We'll use
	<a href="https://marked.js.org/">marked</a>.
</p>

<p>We loop over the content, pull out anything between the start and end delimiters, process it, and put it back in.</p>

<CodeTopper title="/scripts/markdown/table.js">
	<TabPanelItem panel={{ rawHTML: tablePreprocessors }} />
</CodeTopper>

<p>Easy and already halfway there!</p>

<h3>Codeblock Preprocessor</h3>

<p>
	We should be able to declare line properties at the top with <code>///diff-remove:3-10</code> or inline with
	<code>// [!diff-remove]</code>. The same syntax should be used for <code>highlight</code>,
	<code>diff-add</code>, <code>diff-remove</code>, and <code>hide</code>. Hiding code is useful because we might want to
	show only part of a function or class, but keep the syntax highlighting as if the hidden code were there.
</p>

<h4>Transformation Pipeline</h4>

<p>For this one, we want to write:</p>

<CodeTopper title="Codeblock Example: Writing">
	<DiffWrite />
</CodeTopper>

<p>process to (sans whitespace):</p>

<CodeTopper title="Codeblock Example: Processing">
	<DiffProcess />
</CodeTopper>

<p>and render as:</p>

<CodeTopper title="Codeblock Example: Rendering">
	<DiffRender />
</CodeTopper>

<h4>Writing the Preprocessor</h4>

<p>Again, no need to reinvent the wheel. Let's use <a href="https://github.com/shikijs/shiki">Shiki</a>.</p>

<p>First, let's decide on the languages we want to load.</p>

<CodeTopper title="codeblockPreprocessor.ts Part 1">
	<!-- shiki-start
```ts
import { type BundledLanguage as ShikiLang } from 'shiki';

export const mdLanguages = ['json', 'sh', 'html', 'css', 'md', 'js', 'ts', 'svelte', 'diff'] satisfies ShikiLang[];
export type MdLang = (typeof mdLanguages)[number];
export const isMdLang = (lang?: string): lang is MdLang => mdLanguages.includes(lang as MdLang);
```
shiki-end -->
</CodeTopper>

<p>Let's make sure to escape Svelte characters too.</p>

<CodeTopper title="codeblockPreprocessor.ts Part 2">
	<!-- shiki-start
```ts
const escapeSvelte = (code: string) => {
	return code.replace(/[{}`]/g, (match) => {
		return {
			'{': '&lbrace;',
			'}': '&rbrace;',
			'`': '&grave;',
		}[match]!;
	});
};
```
shiki-end -->
</CodeTopper>

<p>
	We know we want to be detect things like line highlighting and diffing, so we'll check for a custom
	<code>///highlight:</code> or <code>// [!highlight]</code> syntax, extract the line data, and remove the syntax from the
	output.
</p>

<CodeTopper title="codeblockPreprocessor.ts Part 3">
	<!-- shiki-start
```ts
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
	['highlighted', /^\/\/\/\s*highlight:(.*)\s*\n/m, ' // &brackbang;highlight]'],
	['hidden', /^\/\/\/\s*hide:(.*)\s*\n/m, ' // &brackbang;hide'],
	['diff-added', /^\/\/\/\s*diff-add:(.*)\s*\n/m, ' // &brackbang;diff-add'],
	['diff-removed', /^\/\/\/\s*diff-remove:(.*)\s*\n/m, ' // &brackbang;diff-remove'],
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
```
shiki-end -->
</CodeTopper>

<p>
	Next we'll need to choose a light and dark theme to create our highlighter. I'll use
	<code>
		<a href="https://textmate-grammars-themes.netlify.app/?theme=rose-pine-dawn&grammar=typescript">rose-pine-dawn</a>
	</code>
	for the light theme and
	<code><a href="https://github.com/timothycohen/samplekit/blob/main/packages/markdown/src/darker.ts">darker</a></code>
	– my own modified version of VS Code <code>dark+</code> – for the dark theme.
</p>

<CodeTopper title="codeblockPreprocessor.ts Part 4">
	<!-- shiki-start
```ts
import { getHighlighter } from 'shiki';
import darkerJSON from './darker.js';

const highlighter = await getHighlighter({
	themes: [darkerJSON, 'rose-pine-dawn'],
	langs: mdLanguages,
});
```
shiki-end -->
</CodeTopper>

<p>Now we can use it to render some HTML!</p>

<CodeTopper title="codeblockPreprocessor.ts Part 5">
	<!-- shiki-start
```ts
import type { Element } from 'hast';

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

export const mdCodeBlockToRawHtml = ({ rawCode, lang }: { rawCode: string; lang: MdLang }) => {
	try {
		const { strippedCode: code, lineProps, preProps } = getLineProps(rawCode);
		return {
			data:
				`<div class="code-wrapper">` + escapeSvelte(createThemedCodeHtml({ code, lang, lineProps, preProps })) + '</div>',
		};
	} catch (err) {
		if (err instanceof Error) return { error: err };
		return { error: new Error(`Unable to highlight`) };
	}
};
```
shiki-end -->
</CodeTopper>

<p>
	Our preprocessor code will give us the raw markup, including the <code>```</code> or <code>~~~</code> markdown code block
	delimiter, so let's write a function to parse and remove the wrapper from the raw input.
</p>

<CodeTopper title="codeblockPreprocessor.ts Part 6">
	<!-- shiki-start
```ts
const parseAndRemoveWrapper = (
	rawMarkdown: string,
): { rawCode: string; lang: MdLang; error?: never } | { rawCode?: never; lang?: never; error: Error } => {
	rawMarkdown = rawMarkdown.trim();
	const lines = rawMarkdown.split('\n');
	const firstLine = lines[0];
	if (!firstLine) return { error: new Error('Markdown file is empty') };

	const startsWith = firstLine.startsWith('&tripgrave;') ? '&tripgrave;' : firstLine.startsWith('&triptilde;') ? '&triptilde;' : null;
	if (!startsWith) return { error: new Error('Markdown file is not a codeblock') };

	let lang: string;
	if (startsWith === '&tripgrave;') {
		lang = firstLine.replace('&tripgrave;', '').trim();
		lines.splice(0, 1);
	} else {
		lang = firstLine.replace('&triptilde;', '').trim();
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
```
shiki-end -->
</CodeTopper>

<p>
	We have everything needed to write our processor, so let's get to it. We'll use the same loop and replace method as
	<code>preprocessTable</code>.
</p>

<CodeTopper title="codeblockPreprocessor.ts Part 7">
	<!-- shiki-start
```ts
export function processCodeblock({
	include,
	logger,
	formatLogFilename,
}: {
	logger?: { error: (s: string) => void; debug: (s: string) => void; warn: (s: string) => void };
	include?: (filename: string) => boolean;
	formatLogFilename?: (filename: string) => string;
} = {}) {
	return {
		markup({ content, filename }: { content: string; filename: string }): { code: string } | null {
			if (include && !include(filename)) return null;
			const format = formatLogFilename || ((filename: string) => filename);

			const delimiters = [
				{ startRegex: new RegExp('&tripgrave;(' + mdLanguages.join('|') + ')'), endMarker: '&tripgrave;' },
				{ startRegex: new RegExp('&triptilde;(' + mdLanguages.join('|') + ')'), endMarker: '&triptilde;' },
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
						`[PREPROCESS] | ${format(filename)} | Codeblock | Error | Incomplete md at start ${startIdx} (count: ${count}). Aborting.`,
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
						`[PREPROCESS] | ${format(filename)} | Codeblock | Warning | Unable to process at start ${startIdx} count ${count}. Skipping.`,
					);
				}

				resultContent = before + processedContent + after;
				startMatch = startRegex.exec(resultContent);
			}

			logger?.debug(`[PREPROCESS] | ${format(filename)} | Codeblock | Success | { count: ${count} } }`);

			return { code: resultContent };
		},
	};
}
```
shiki-end -->
</CodeTopper>

<p>We've finished the preprocessor. Full code below.</p>

<CodeTopper title="codeblockPreprocessor.ts Full" initialCollapsed>
	<TabPanelItem
		panel={{ rawHTML: data.article.demos?.main?.find((d) => d.title === 'codeblockPreprocessor.ts')?.rawHTML ?? '' }}
	/>
</CodeTopper>

<p>And finally, we add a touch of css:</p>

<CodeTopper title="code-block.css">
	<TabPanelItem panel={{ rawHTML: codeBlocks }} />
</CodeTopper>

<h2>Conclusion</h2>

<p>
	Svelte preprocessors are powerful even with a painless setup like we've implemented here. I'm grateful to
	<a href="https://github.com/pngwn/MDsveX">MDsveX</a>,
	<a href="https://github.com/vnphanquang/svelte-put">svelte-put</a>, and
	<a href="https://melt-ui.com/docs/preprocessor">Melt UI</a>
	for introducing them to me, and I hope this article helps you get started with your own preprocessors. If you have a question
	or want to share your preprocessor, share it in the
	<a href="https://github.com/timothycohen/samplekit/discussions">GitHub discussions</a>!
</p>

<p>Happy coding!</p>
