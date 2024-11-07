<script lang="ts" module>
	import { GH_TREE } from '$lib/consts';
	import video from './assets/2024-08-05_22-41-28_889x627.mp4';
	import imgSm from './assets/preprocessors-thumbnail-1200w.webp';
	import type { RawFrontMatter } from '$lib/articles/schemas';

	export const metadata = {
		title: 'Blog with Preprocessors',
		implementationPath: '/articles/preprocessors/#demo',
		srcCodeHref: `${GH_TREE}/packages/`,
		description:
			'Use preprocessors to highlight code blocks, render math, and write Markdown directly in Svelte components – all without disrupting other tooling.',
		publishedAt: new Date('2024-03-06 16:16:15 -0500'),
		authors: [{ name: 'Tim Cohen', email: 'contact@timcohen.dev' }],
		imgSm,
		video,
		tags: ['preprocessors', 'blog', 'markdown', 'code highlighting', 'DX'],
		featured: true,
		updates: [
			{ at: new Date('2024-08-15 18:24:50 -0400'), descriptions: ['Update to use @samplekit preprocessors.'] },
			{ at: new Date('2024-03-21 13:59:53 -0400'), descriptions: ['Add formatLogFilename.'] },
			{ at: new Date('2024-03-20 16:11:27 -0400'), descriptions: ['Expand processor syntax beyond highlighting.'] },
		],
	} satisfies RawFrontMatter;
</script>

<script lang="ts">
	import { CodeTopper, HAnchor, TabPanels } from '$lib/articles/components';
	import { GH_ROOT } from '$lib/consts';

	const { data } = $props();

	const svelteConfig = data.article.demos?.main?.find((e) => e.title === 'svelte.config.js')?.rawHTML;
	const codeBlocks = data.codeBlockCss;
	if (!svelteConfig || !codeBlocks) throw new Error('Missing data');
</script>

<p>When creating this website, I had a few DX requirements for the articles:</p>

<ul>
	<li class="list-disc">preserve all the tooling Svelte offers</li>
	<li class="list-disc">write tables in Markdown</li>
	<li class="list-disc">style dark code blocks with my personal VS Code theme</li>
	<li class="list-disc">add new features (like Math) as needed</li>
	<li class="list-disc">transform everything on the server</li>
	<li class="list-disc">write the code as if it were on the client</li>
	<li class="list-disc">not have to wait for compatibility when Svelte 5 is released</li>
</ul>

<HAnchor tag="h2" title="Evaluating the Options" />

<HAnchor tag="h3" title="0.1: Unified" />

<p>
	Unified is an ecosystem of packages that all accept a standardized abstract syntax tree (AST). The uniformity means
	you can convert your language into an AST, run a pipeline of transformations, and then transform it into some other
	language. Originally, I thought of using the unified ecosystem to convert Markdown to an AST, use
	<code>rehypePrettyCode</code> in the middle for styling, and then convert it to HTML. This is a great solution for technical
	and non-technical users alike because of how easy Markdown is to write.
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

/** @throws Error if the file cannot be read or parsed */
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
	The largest drawback is that we'd be writing Markdown and forgoing the Svelte ecosystem entirely. Furthermore, even if
	that were acceptable, this makes inlining Svelte components cumbersome. Would we write multiple <code>.md</code>
	files, import/process them separately, and embed them into <code>.svelte</code> components? Would we write Markdown, and
	inject Svelte components in-between?
</p>

<HAnchor tag="h3" title="0.2: MDsveX" />
<p>
	<a href="https://MDsveX.pngwn.io/docs/" data-external>MDsveX</a> – a Markdown preprocessor for Svelte – solves the
	embedded Svelte problem.
	<a href="https://kit.svelte.dev/docs/integrations#preprocessors" data-external>Preprocessors</a> transform the input files
	before passing them to the Svelte compiler, and this particular preprocessor enables writing Markdown and Svelte in the
	same file.
</p>

<p>
	The biggest concern at the time of my decision was that it hadn't been updated in 7 months with over 150+ open issues.
	It didn't inspire confidence that it would support Svelte 5 upon its release, which was a large consideration in which
	method to use. Ideally, the technique we use would be resistant to changes in Svelte. The second reason was that
	MDsveX is a separate language, and because of that, it wouldn't <span class="italic">just work</span> with other Svelte
	tooling.
</p>

<p>
	I really only want Markdown for three things: tables, code blocks, and math. The general idea of a preprocessor,
	however, is very appealing.
</p>

<HAnchor tag="h3" title="0.3: Preprocessors" />

<p>
	We can easily add a new feature to Svelte by writing a simple preprocessor wrapping a dedicated package for each new
	functionality. There's <a href="https://marked.js.org/" data-external>Marked</a> for Markdown,
	<a href="https://github.com/shikijs/shiki" data-external>Shiki</a>
	for code highlighting, and <a href="https://katex.org/" data-external>KaTeX</a> for math.
</p>

<div class="my-5">
	The main requirement is to work inside <code>.svelte</code> files alongside the Svelte language server, Prettier,
	ESLint, etc. This means we need syntax that is ignored by all tooling. Luckily, we already have such a thing: the HTML
	comment:
	<!-- shiki-start
t-comment-inline
```ts
```
shiki-end -->. Bonus points that it already has a shortcut keybinding and
	simply turns into a comment if the preprocessor isn't present. With this, we can decide upon some delimiters.
</div>

<div class="no-lines grid grid-cols-2 gap-6">
	<!-- shiki-start
t-shiki-block
```ts
const foo = "bar";
```
shiki-end -->

	<!-- shiki-start
t-md-block
```md
# Markdown
```
shiki-end -->
</div>

<!-- shiki-start
t-comment-block
```latex
\[ V={4 \over 3}\pi r^{3} \]
```
shiki-end -->

<HAnchor tag="h2" title="Writing the Preprocessors" />

<HAnchor tag="h3" title="Markdown" />

<p>
	We'll start with the Markdown preprocessor because it does nothing but wrap <code>Marked</code>. Writing a
	preprocessor that wraps an existing package is dead simple. We just have to remove the code between our delimiters,
	process it, and put it back in. There are two obvious choices for how to pull out the code. We can either loop over
	the raw string content with <code>indexOf</code> or we can walk a Svelte AST tree. Here are two examples of how we can
	implement the preprocessor.
</p>

{#snippet StringApproach()}
	<!-- shiki-start
```ts
import { marked as hostedMarked } from 'marked';
import type { Logger } from './logger.js';
import type { PreprocessorGroup } from 'svelte/compiler';

const delimiter = { start: 'md-start', end: 'md-end' };

/**
 * @throws {Error} If the comment block is incomplete.
 */
const replaceComments = (content: string, replacer: (comment: string) => null | string): string => {
	let resultContent = content;

	let startIdx = resultContent.indexOf('&openhtmlcomment;');

	while (startIdx !== -1) {
		const endIdx = resultContent.indexOf('&closehtmlcomment;', startIdx + 4);
		if (endIdx === -1) throw new Error(`Incomplete comment block at start ${startIdx}. Aborting.`);

		const extractedContent = resultContent.substring(startIdx + 4, endIdx);

		const replaced = replacer(extractedContent);
		if (replaced === null) {
			startIdx = resultContent.indexOf('&openhtmlcomment;', endIdx + 3);
			continue;
		}
		const before = resultContent.substring(0, startIdx);
		const after = resultContent.substring(endIdx + 3);

		resultContent = before + replaced + after;
		startIdx = resultContent.indexOf('&openhtmlcomment;', startIdx + replaced.length);
	}

	return resultContent;
};

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
				let count = 0;

				const code = replaceComments(content, (comment) => {
					let trimmed = comment.trim();
					if (!trimmed.startsWith(delimiter.start)) return null;
					count++;
					if (!trimmed.endsWith(delimiter.end)) throw new Error(`Incomplete md (count: ${count}). Aborting.`);
					trimmed = trimmed.substring(delimiter.start.length + 1, trimmed.length - delimiter.end.length);
					return marked(trimmed, { async: false }) as string;
				});

				if (count) logger?.info?.({ count }, filename);
				return { code };
			} catch (err) {
				if (err instanceof Error) logger?.error?.(err, filename);
				else logger?.error?.(Error('Failed to render Markdown.'), filename);
			}
		},
	} satisfies PreprocessorGroup;
}
```
shiki-end -->
{/snippet}

{#snippet Logger()}
	<!-- shiki-start
```ts
export type Logger = {
	error?: (e: Error, filename: string) => void;
	info?: (a: { count: number }, filename: string) => void;
};

export const createMdLogger = (formatFilename: (filename: string) => void = (filename: string) => filename): Logger => {
	return {
		error: (e, filename) => console.error(`[PREPROCESS] | Mark | Error | ${formatFilename(filename)} | ${e.message}`),
		info: (detail, filename) =>
			console.info(`[PREPROCESS] | Mark | Info | ${formatFilename(filename)} | count: ${detail.count}`),
	};
};
```
shiki-end -->
{/snippet}

{#snippet ASTApproach()}
	<!-- shiki-start
```ts
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { marked as hostedMarked } from 'marked';
import { parse, type PreprocessorGroup } from 'svelte/compiler';
import type { Logger } from './logger.js';

const delimiter = { start: 'md-start', end: 'md-end' };
const delimLoc = { start: delimiter.start.length + 1, end: -delimiter.end.length - 1 };

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
					enter(node: (typeof ast.fragment.nodes)[number]) {
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
```
shiki-end -->
{/snippet}

<TabPanels
	files={[
		{ snippet: ASTApproach, title: 'AST Approach' },
		{ snippet: StringApproach, title: 'String Approach' },
		{ snippet: Logger, title: 'logger.ts' },
	]}
/>

<p>And we can now register it with Svelte.</p>

<CodeTopper title="svelte.config.js">
	<!-- shiki-start
```js
import { processMarkdown, createMdLogger } from '@samplekit/preprocess-markdown';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { opts } from './src/lib/shiki/index.js';

const preprocessorRoot = `${import.meta.dirname}/src/routes/`;
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '');
const include = (/** @type {string} */ filename) => filename.startsWith(preprocessorRoot);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		processMarkdown({
			include,
			logger: createMdLogger(formatFilename),
		}),
		vitePreprocess(),
	],
	kit: {
		adapter: adapter(),
	},
};

export default config;
```
shiki-end -->
</CodeTopper>

<p>
	Hopefully it's clear how powerful this simple idea is. We <span class="italic">could</span> write some complicated logic
	to parse a file and determine where a table might start or end, but that would necessarily require us to work in a different
	language without the Svelte ecosystem. In my opinion sacrificing Svelte tooling to use these preprocessors would be the
	wrong tradeoff.
</p>

<HAnchor tag="h3" title="Math" />

<p>
	We'll do the same thing for Markdown, but in this version, we'll want two delimiters. One for inline math like this <!--\( V={4 \over 3}\pi r^{3} \) -->
	and one for display math like this:
</p>

<!-- \[
\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}
\] -->

<p>It's very similar to the AST approach above.</p>

<CodeTopper title="preprocess-katex">
	<!-- shiki-start
```ts
import { walk } from 'estree-walker';
import katex from 'katex';
import MagicString from 'magic-string';
import { parse, type PreprocessorGroup } from 'svelte/compiler';
import type { Logger } from './logger.js';

const display = { start: String.raw`\[`, end: String.raw`\]` };
const inline = { start: String.raw`\(`, end: String.raw`\)` };
const delimLoc = { start: 3, end: -3 };

type RenderToString = (
	tex: string,
	options: {
		displayMode?: boolean | undefined;
		throwOnError: true;
		strict: (errorCode: string, errorMsg: string) => 'ignore' | undefined;
	},
) => string;

export function processKatex({
	include,
	logger,
	renderToString = katex.renderToString,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
	renderToString?: RenderToString;
} = {}) {
	return {
		name: 'katex',
		markup({ content, filename }) {
			if (!filename) return;
			if (include && !include(filename)) return;
			const s = new MagicString(content);
			const ast = parse(content, { filename, modern: true });
			let count = 0;

			walk(ast.fragment, {
				enter(node: (typeof ast.fragment.nodes)[number]) {
					if (node.type !== 'Comment') return;
					const trimmed = node.data.trim();

					let displayMode: boolean | undefined = undefined;
					if (trimmed.startsWith(display.start) && trimmed.endsWith(display.end)) displayMode = true;
					else if (trimmed.startsWith(inline.start) && trimmed.endsWith(inline.end)) displayMode = false;
					if (displayMode === undefined) return;

					s.remove(node.start, node.end);

					let parsed;
					try {
						const rawInput = String.raw`${trimmed.slice(delimLoc.start, delimLoc.end)}`;
						parsed = renderToString(rawInput, {
							displayMode,
							throwOnError: true,
						});
					} catch (err) {
						logger?.error?.(err instanceof Error ? err : Error('Failed to render KaTeX.'), filename);
						return;
					}

					const content = displayMode
						? `<div class="overflow-x-auto">{@html \`${parsed}\`}</div>`
						: `{@html \`${parsed}\`}`;
					s.appendLeft(node.start, content);
					count++;
				},
			});

			if (count) logger?.info?.({ count }, filename);

			return { code: s.toString() };
		},
	} satisfies PreprocessorGroup;
}
```
shiki-end -->
</CodeTopper>

<p>Annoyingly, KaTeX logs directly to the console. To prevent this, let's wrap the call to KaTeX in a trap function.</p>

<CodeTopper title="preprocess-katex">
	<!-- shiki-start
```ts
import { walk } from 'estree-walker';
import katex from 'katex';
import MagicString from 'magic-string';
import { parse, type PreprocessorGroup } from 'svelte/compiler';
import type { Logger } from './logger.js';

const display = { start: String.raw`\[`, end: String.raw`\]` };
const inline = { start: String.raw`\(`, end: String.raw`\)` };
const delimLoc = { start: 3, end: -3 };

// https://github.com/KaTeX/KaTeX/issues/3720
const catchStdErr = ({ tmpWrite, trappedFn }: { trappedFn: () => void; tmpWrite: (str: string) => boolean }) => {//! d"diff-add"
	const write = process.stdout.write;//! d"diff-add"
	try {//! d"diff-add"
		process.stderr.write = tmpWrite;//! d"diff-add"
		trappedFn();//! d"diff-add"
	} finally {//! d"diff-add"
		process.stderr.write = write;//! d"diff-add"
	}//! d"diff-add"
};//! d"diff-add"

type RenderToString = (
	tex: string,
	options: {
		displayMode?: boolean | undefined;
		throwOnError: true;
		strict: (errorCode: string, errorMsg: string) => 'ignore' | undefined;
	},
) => string;

export function processKatex({
	include,
	logger,
	renderToString = katex.renderToString,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
	renderToString?: RenderToString;
} = {}) {
	return {
		name: 'katex',
		markup({ content, filename }) {
			if (!filename) return;
			if (include && !include(filename)) return;
			const s = new MagicString(content);
			const ast = parse(content, { filename, modern: true });
			let count = 0;

			walk(ast.fragment, {
				enter(node: (typeof ast.fragment.nodes)[number]) {
					if (node.type !== 'Comment') return;
					const trimmed = node.data.trim();

					let displayMode: boolean | undefined = undefined;
					if (trimmed.startsWith(display.start) && trimmed.endsWith(display.end)) displayMode = true;
					else if (trimmed.startsWith(inline.start) && trimmed.endsWith(inline.end)) displayMode = false;
					if (displayMode === undefined) return;

					s.remove(node.start, node.end);

					let parsed;
					try {
						const rawInput = String.raw`${trimmed.slice(delimLoc.start, delimLoc.end)}`;
						const warns: Error[] = [];//! d"diff-add"
						catchStdErr({//! d"diff-add"
							trappedFn: () => {//! d"diff-add"
								parsed = renderToString(rawInput, {
									displayMode,
									throwOnError: true,
								});
							},//! d"diff-add"
							tmpWrite: (str) => {//! d"diff-add"
								if (!str.startsWith('No character metrics for ')) warns.push(Error(str));//! d"diff-add"
								return true;//! d"diff-add"
							},//! d"diff-add"
						});//! d"diff-add"
						if (logger?.warn) {//! d"diff-add"
							warns.forEach((err) => logger.warn?.(err, filename));//! d"diff-add"
						}//! d"diff-add"
					} catch (err) {
						logger?.error?.(err instanceof Error ? err : Error('Failed to render KaTeX.'), filename);
						return;
					}

					const content = displayMode
						? `<div class="overflow-x-auto">{@html \`${parsed}\`}</div>`
						: `{@html \`${parsed}\`}`;
					s.appendLeft(node.start, content);
					count++;
				},
			});

			if (count) logger?.info?.({ count }, filename);

			return { code: s.toString() };
		},
	} satisfies PreprocessorGroup;
}
```
shiki-end -->
</CodeTopper>

<p>
	Looks good. But what about reactivity? It's quite possible you'll want to use handlebar substitution inside the
	equations. If we simply tried to use it as is, KaTeX would choke on the syntax. We'll have to make a special TeX like
	macro for Svelte.
	<code>\s</code> seems as good as any. It should take the Svelte content out, replace it with unique single character placeholders,
	process the TeX, and then put the Svelte content back in.
</p>

<CodeTopper title="Svelte Reactivity">
	<!-- shiki-start
```ts
// the nuts and bolts of it
const { svelteFreeString, extractedSvelteContent } = replaceSvelteAndStore(rawInput);
const mathString = katex.renderToString(svelteFreeString)
const parsed = restoreSvelte(mathString, extractedSvelteContent);
```
shiki-end -->
</CodeTopper>

<p>We'll use some Unicode characters as our storage placeholder.</p>

<CodeTopper title="preprocess-katex">
	<!-- shiki-start
d"diff-add" l"21-79"
```ts
import { walk } from 'estree-walker';
import katex from 'katex';
import MagicString from 'magic-string';
import { parse, type PreprocessorGroup } from 'svelte/compiler';
import type { Logger } from './logger.js';

const display = { start: String.raw`\[`, end: String.raw`\]` };
const inline = { start: String.raw`\(`, end: String.raw`\)` };
const delimLoc = { start: 3, end: -3 };

// https://github.com/KaTeX/KaTeX/issues/3720
const catchStdErr = ({ tmpWrite, trappedFn }: { trappedFn: () => void; tmpWrite: (str: string) => boolean }) => {
	const write = process.stdout.write;
	try {
		process.stderr.write = tmpWrite;
		trappedFn();
	} finally {
		process.stderr.write = write;
	}
};

const unicodeInsertionPlaceholders = [
	'␇',
	'␈',
	'␉',
	'␊',
	'␋',
	'␌',
	'␍',
	'␎',
	'␏',
	'␐',
	'␑',
	'␒',
	'␓',
	'␔',
	'␕',
	'␖',
	'␗',
	'␘',
	'␙',
	'␚',
	'␛',
	'␜',
	'␝',
	'␞',
	'␟',
	'␠',
];

function replaceSvelteAndStore(input: string): { svelteFreeString: string; extractedSvelteContent: string[] } {
	const extractedSvelteContent: string[] = [];
	let index = 0;
	const svelteFreeString = input.replace(/\\s\{([^}]*)\}/g, (_match, p1) => {
		if (index >= unicodeInsertionPlaceholders.length) throw new Error('Too many variable substitutions.');
		extractedSvelteContent.push(p1);
		const unicodePlaceholder = unicodeInsertionPlaceholders[index];
		index++;
		return `{` + unicodePlaceholder + `}`;
	});

	return { svelteFreeString, extractedSvelteContent };
}

function restoreSvelte(mathString: string, extractedSvelteContent: string[]): string {
	if (!extractedSvelteContent.length) return mathString;

	const unicodeMap = new Map();
	extractedSvelteContent.forEach((content, i) => {
		unicodeMap.set(unicodeInsertionPlaceholders[i], content);
	});

	const unicodePlaceholderRegex = new RegExp(`(${unicodeInsertionPlaceholders.join('|')})`, 'g');

	return mathString.replaceAll(unicodePlaceholderRegex, (placeholder) => {
		const svelteContent = unicodeMap.get(placeholder);
		return `\${${svelteContent}}`;
	});
}

type RenderToString = (
	tex: string,
	options: {
		displayMode?: boolean | undefined;
		throwOnError: true;
		strict: (errorCode: string, errorMsg: string) => 'ignore' | undefined;
	},
) => string;

export function processKatex({
	include,
	logger,
	renderToString = katex.renderToString,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
	renderToString?: RenderToString;
} = {}) {
	return {
		name: 'katex',
		markup({ content, filename }) {
			if (!filename) return;
			if (include && !include(filename)) return;
			const s = new MagicString(content);
			const ast = parse(content, { filename, modern: true });
			let count = 0;

			walk(ast.fragment, {
				enter(node: (typeof ast.fragment.nodes)[number]) {
					if (node.type !== 'Comment') return;
					const trimmed = node.data.trim();

					let displayMode: boolean | undefined = undefined;
					if (trimmed.startsWith(display.start) && trimmed.endsWith(display.end)) displayMode = true;
					else if (trimmed.startsWith(inline.start) && trimmed.endsWith(inline.end)) displayMode = false;
					if (displayMode === undefined) return;

					s.remove(node.start, node.end);

					let parsed;
					try {
						const rawInput = String.raw`${trimmed.slice(delimLoc.start, delimLoc.end)}`;
						const { svelteFreeString, extractedSvelteContent } = replaceSvelteAndStore(rawInput);//! d"diff-add"
						const warns: Error[] = [];
						catchStdErr({
							trappedFn: () => {
								const mathString = renderToString(svelteFreeString, {//! d"diff-add"
									displayMode,
									throwOnError: true,
									strict: (errorCode: string, errorMsg: string) => {//! d"diff-add"
										if (errorCode === 'unknownSymbol' && errorMsg.startsWith('Unrecognized Unicode character'))//! d"diff-add"
											return 'ignore';//! d"diff-add"
									},//! d"diff-add"
								});
								parsed = restoreSvelte(mathString, extractedSvelteContent);//! d"diff-add"
							},
							tmpWrite: (str) => {
								if (!str.startsWith('No character metrics for ')) warns.push(Error(str));
								return true;
							},
						});
						if (logger?.warn) {
							warns.forEach((err) => logger.warn?.(err, filename));
						}
					} catch (err) {
						logger?.error?.(err instanceof Error ? err : Error('Failed to render KaTeX.'), filename);
						return;
					}
					const content = displayMode
						? `<div class="overflow-x-auto">{@html \`${parsed}\`}</div>`
						: `{@html \`${parsed}\`}`;
					s.appendLeft(node.start, content);
					count++;
				},
			});

			if (count) logger?.info?.({ count }, filename);

			return { code: s.toString() };
		},
	} satisfies PreprocessorGroup;
}
```
shiki-end -->
</CodeTopper>

<p>Easy – two down and one to go!</p>

<HAnchor tag="h3" title="Code Decoration" />

<div>
	We've saved the best for last. Fundamentally, there doesn't need to be anything different about this preprocessor than
	the other two we've done so far. But simply wrapping Shiki without the ability to customize decorations would be an
	injustice. So, we'll add the ability to add data attributes and classes using Shiki's Decoration API. Ideally we could
	add it to the <!-- shiki-html <pre> shiki-html --> tag, line ranges, index ranges, substrings, etc.
</div>

<p>
	We'll need a place for our preprocessor to look for the options. If we look back at our delimiter syntax, we have an
	obvious place: between the front delimiter and code fence. For convenience, let's also allow line options to be at the
	end of the line they're scoped to.
</p>

<!-- shiki-start
t-shiki-block
~~~md
s"foo" c"border border-accent-9"
```ts
const foo = "bar";
const added = true;//!p d"diff-add"
```
~~~
shiki-end -->

<!-- shiki-start
s"foo" c"border border-accent-9"
```ts
const foo = "bar";
const added = true;//! d"diff-add"
```
shiki-end -->

<p>
	Because we're supporting options, this preprocessor will be more involved than the other two. We'll first need to
	split the raw string into the global options, inline options, code fence, language, and code. Then we can pass
	everything off to a function that calls Shiki <code>codeToHtml</code> and applies Shiki decorations based on the extracted
	options.
</p>

<!-- shiki-start
```ts
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { parse } from 'svelte/compiler';
import { getOrLoadOpts } from './defaultOpts.js';
import { codeToDecoratedHtmlSync } from './highlight.js';
import { stripOptions } from './strip-options/index.js';
import type { PreprocessOpts, Logger, PreprocessorGroup } from './types.js';

export function processCodeblockSync({
	opts,
	include,
	logger,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
	opts: PreprocessOpts;
}) {
	return {
		name: 'codeblock',
		markup({ content, filename }) {
			if (!filename) return;
			if (include && !include(filename)) return;
			const s = new MagicString(content);
			const ast = parse(content, { filename, modern: true });
			let count = 0;

			walk(ast.fragment, {
				enter(node) {
					if (node.type !== 'Comment') return;
					const trimmed = node.data.trim();
					if (!trimmed.startsWith(opts.delimiters.common)) return;

					if (trimmed.endsWith(opts.delimiters.fenced.end)) {
						s.remove(node.start, node.end);

						const prepared = stripOptions(
							// escapePreprocessor allows us to write things like &closehtmlcomment; which would
							// otherwise terminate the html comment surrounding our preprocessor
							opts.escapePreprocessor({
								code: trimmed.slice(opts.delimiters.fenced.startLoc, opts.delimiters.fenced.endLoc),
							}),
							(e: Error) => logger?.warn?.(e, filename),
						);
						if (prepared instanceof Error) {
							return logger?.error?.(prepared, filename);
						}

						const {
							lang,
							lineToProperties,
							tranName, // we haven't discussed this, but this allows us to register custom transform functions
							preProperties,
							strippedCode,
							windowProperties,
							allLinesProperties,
						} = prepared;
						if (!opts.highlighterCore.getLoadedLanguages().includes(lang)) {
							return logger?.error?.(
								Error(
									lang
										? `Language ${lang} not loaded. Hint: try \`opts: await getOrLoadOpts({ langNames: ['${lang}'] })\` and restart the server.`
										: 'No lang provided.',
								),
								filename,
							);
						}

						let transformName = 'block';
						if (tranName && opts.transformMap[tranName]) {
							transformName = tranName;
						} else if (tranName !== null) {
							const keys = Object.keys(opts.transformMap);
							logger?.warn?.(
								Error(`${tranName} not in opts.transformMap. Defaulting to 'block'. Options: (${keys.join(', ')}).`),
								filename,
							);
						}

						const { error, data } = codeToDecoratedHtmlSync({
							opts,
							lineToProperties,
							allLinesProperties,
							preProperties,
							windowProperties,
							code: strippedCode,
							transformName,
							lang,
						});
						if (error) {
							return logger?.error?.(error, filename);
						}

						s.appendLeft(node.start, data);
						count++;
						return;
					}

					for (const { delimLoc, delimiter, lang } of opts.delimiters.inline) {
						if (trimmed.endsWith(delimiter)) {
							s.remove(node.start, node.end);

							const { error, data } = codeToDecoratedHtmlSync({
								code: opts.escapePreprocessor({ code: trimmed.slice(delimLoc.start, delimLoc.end) }),
								lang,
								opts,
								transformName: 'inline',
							});
							if (error) {
								return logger?.error?.(error, filename);
							}

							s.appendLeft(node.start, data);
							count++;
							break;
						}
					}
				},
			});

			if (count) {
				logger?.info?.({ count }, filename);
			}

			return { code: s.toString() };
		},
	} satisfies PreprocessorGroup;
}
```
shiki-end -->

<p>
	Shiki is async, so we'll wrap the previous function with another that awaits the default options containing the Shiki
	<code>Highlighter</code>.
</p>

<!-- shiki-start
```ts
export async function processCodeblock({
	include,
	logger,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
}) {
	return processCodeblockSync({ include, logger, opts: await getOrLoadOpts() });
}
```
shiki-end -->

<p>
	For brevity, the details behind the options extraction have been omitted, but the actual preprocessor part is very
	similar to the other two. Full functionality details are available in the
	<a href="https://preprocessors.samplekit.dev/docs/code-decoration/">docs</a>.
</p>

<HAnchor tag="h2" title="Code Editor Support" />

<p>
	We've finished our preprocessors, but they're hard to use without syntax highlighting in our code editor. Everything
	is formatted like a comment. Let's fix that by writing a VS Code extension!
</p>

<HAnchor tag="h3" title="Overview" />

<p>
	The <span class="italic">best</span> way to do this would be to follow the
	<a data-external href="https://code.visualstudio.com/api/get-started/your-first-extension">
		official VS Code extension docs
	</a>. It shows how to use Yeoman to scaffold an extension. These are simple extensions though, so we'll just write
	them directly instead.
</p>

<p>
	We need to write a <code>package.json</code> with a <code>contributes</code> field. In it, we'll have
	<code>grammars</code> and <code>snippets</code>. When we're ready, we'll run <code>vsce package</code> to package the
	extension and metadata. Then, we can install it with
	<code>code --install-extension &lt;extension-name&gt;</code>. This will add it to the
	<code>~/.vscode/extensions</code> folder (or wherever your install location is).
</p>

<HAnchor tag="h3" title="Syntaxes" />

<p>
	Let's use the Markdown preprocessor as an example. We'll create a repo for the VS Code extension and add a
	<code>package.json</code>. In it, we'll add a section to point VS Code to the grammar declaration file.
</p>

<CodeTopper title="package.json">
	<!-- shiki-start
```json
{
"contributes": {
		"grammars": [
			{
				"scopeName": "md.pp-svelte",
				"injectTo": [
					"source.svelte"
				],
				"path": "./syntaxes/md.pp-svelte.tmLanguage.json"
			}
		],
	}
}
```
shiki-end -->
</CodeTopper>

<div class="my-6">
	VS Code uses <a href="https://github.com/microsoft/vscode-textmate">TextMate grammar</a>. If you open the VS Code
	command palette and search <code>Developer: Inspect Editor Tokens and Scopes</code>, you can see how things are
	highlighted. Everything exists in a textmate scope, and that scope is targeted by your VS Code theme for decorating.
	Our job is to tell VS Code, "when you see
	<!-- shiki-start
t-md-inline
```html
```
shiki-end -->
	in a Svelte template, open up our custom scope, highlight the delimiter like a control keyword, and highlight the internals
	like Markdown." This is how we do it:
</div>

<CodeTopper title="./syntaxes/md.pp-svelte.tmLanguage.json">
	<!-- shiki-start
```json
{
	"name": "Svelte Component Markdown Injection",
	// the name matches what we put in the package.json
	"scopeName": "md.pp-svelte",
	// only match within the svelte scope
	"injectionSelector": "L:source.svelte",
	"fileTypes": [],
	"patterns": [
		{
			// start with the HTML comment opening. Use an oniguruma lookahead to only match if the next thing is "md-start"
			"begin": "&openhtmlcomment;(?=\\s*md-start)",
			// end with the HTML comment closing. Use an oniguruma lookbehind to only match if the last thing matched was "md-end"
			"end": "(?<=.*?md-end)\\s*&closehtmlcomment",
			// give the entire match our custom scope
			"name": "source.pp-svelte",
			"patterns": [
				{
					// inside the match, mark the md-start as a keyword
					"begin": "md-start",
					"beginCaptures": { "0": { "name": "keyword.control.pp-svelte" } },
					// also match the end as a keyword
					"end": ".*?(md-end)",
					"endCaptures": { "1": { "name": "keyword.control.pp-svelte" } },
					// give everything within the &openhtmlcomment; and &closehtmlcomment; our custom markdown scope
					"name": "markdown.pp-svelte",
					// give everything within the md-start and md-end delimiters the real markdown scope
					"contentName": "text.html.markdown",
					// actually use the markdown scope for everything between the delimiters
					"patterns": [{ "include": "text.html.markdown" }]
				}
			]
		}
	]
}
```
shiki-end -->
</CodeTopper>

<p>
	Although this particular file is fairly straightforward, Oniguruma syntax can be... difficult. Writing it in JSON is
	even more tedious because it requires double escaping. <a data-external href="https://regex101.com/">regex101</a> and
	this
	<a data-external href="https://www.apeth.com/nonblog/stories/textmatebundle.html">
		decade old blog post by Matt Neuburg
	</a> are useful shields to defend yourself against the beast that is Oniguruma regex.
</p>

<HAnchor tag="h3" title="Snippets" />

<div class="my-6">
	It would get very old very fast if we needed to write <!-- shiki-start
t-md-inline
```html
```
shiki-end --> all the time.
	Let's write a VS Code snippet so we can write <code>mds</code> instead. Back in our
	<code>package.json</code> we can point to a snippets file.
</div>

<CodeTopper title="package.json">
	<!-- shiki-start
```json
{
	"contributes": {
		"grammars": [
			{
				"scopeName": "md.pp-svelte",
				"injectTo": [
					"source.svelte"
				],
				"path": "./syntaxes/md.pp-svelte.tmLanguage.json"
			}
		],
		"snippets": [//! d"diff-add"
			{//! d"diff-add"
				"language": "svelte",//! d"diff-add"
				"path": "./snippets/md.pp-svelte.code-snippets"//! d"diff-add"
			}//! d"diff-add"
		]//! d"diff-add"
	}
}
```
shiki-end -->
</CodeTopper>

<p>And write it just like a normal VS Code snippets file.</p>

<CodeTopper title="./snippets/md.pp-svelte.code-snippets">
	<!-- shiki-start
```json
{
	"New Markdown block": {
		"scope": "text.svelte",
		"prefix": "md-start",
		"description": "Creates a new markdown block.",
		"body": ["&openhtmlcomment; md-start", "$1", "md-end &closehtmlcomment;", "$0"],
	},
}
```
shiki-end -->
</CodeTopper>

<p>
	Voilà. Now rinse and repeat for the other two – though they're all subtly different. Find the
	<a href="{GH_TREE}/packages/">source code</a> here.
</p>

<HAnchor tag="h2" title="Conclusion" />

<div>
	These three preprocessors and their VS Code extensions are available under NPM and the VS Code marketplace.
	<a href="https://preprocessors.samplekit.dev/docs/code-decoration/">Full documentation here</a>.

	<!-- md-start
| NPM Package                                                                                    | VS Code Extension                                                                                                |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [@samplekit/preprocess-katex](https://www.npmjs.com/package/@samplekit/preprocess-katex)       | [samplekit.svelte-pp-katex](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-katex)       |
| [@samplekit/preprocess-markdown](https://www.npmjs.com/package/@samplekit/preprocess-markdown) | [samplekit.svelte-pp-markdown](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-markdown) |
| [@samplekit/preprocess-shiki](https://www.npmjs.com/package/@samplekit/preprocess-shiki)       | [samplekit.svelte-pp-shiki](https://marketplace.visualstudio.com/items?itemName=samplekit.svelte-pp-shiki)       |
md-end -->
</div>

<p>
	Svelte preprocessors are quite powerful, and by using the HTML comment delimiters, we can have our preprocessors and
	standard tooling too. I'm grateful to
	<a href="https://github.com/pngwn/MDsveX" data-external>MDsveX</a>,
	<a href="https://github.com/vnphanquang/svelte-put" data-external>svelte-put</a>, and
	<a href="https://melt-ui.com/docs/preprocessor" data-external>Melt UI</a>
	for introducing them to me, and I hope this article helps you get started with your own preprocessors. If you have a question
	or want to share your preprocessor, share it in the
	<a href="{GH_ROOT}/discussions" data-external>GitHub discussions</a>!
</p>

<p>Happy coding!</p>
