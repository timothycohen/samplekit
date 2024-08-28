import type { Properties } from 'hast';
import type { HighlighterCore, ThemeInput, LanguageInput, DecorationItem, ShikiTransformer } from 'shiki/core';
import type { BundledLanguage, BundledTheme } from 'shiki/types.mjs';
import type { PreprocessorGroup } from 'svelte/compiler';

export type {
	HighlighterCore,
	ThemeInput,
	LanguageInput,
	DecorationItem,
	PreprocessorGroup,
	BundledTheme,
	BundledLanguage,
	Properties,
};

export type Result<D> = { data: D; error?: never } | { data?: never; error: Error };
export type Range = [number, number];
export type PropertyArrays = { classes: string[]; datas: Array<string | [string, string]> };

/**
 * For use when calling shiki without the processor using `codeToDecoratedHtmlSync`.
 */
export type HighlightOpts = {
	/**
	 * Optionally replace with your own from shiki/core
	 */
	highlighterCore: HighlighterCore;
	/**
	 * All injected styles have this common prefix. For example:
	 *
	 * ```html
	 * <span style="--h-dark:#569CD6;--h-light:#286983;--h-dark-font-style:italic;--h-light-font-style:inherit">SELECT</span>
	 * ```
	 *
	 * @default '--h'
	 */
	cssVarPrefix: string;
	/**
	 * The key is the name applied on the css variable. For example, 'light' will apply '--h-light:...'
	 *
	 * The value is the name specified in the textmate grammar of the loaded Shiki theme.
	 *
	 * @default {dark: 'darker', light: 'rose-pine-dawn'}
	 */
	cssVarToThemeName: Record<string, string>;
	/**
	 * The transform map can be used to define the default properties and to call ShikiTransformers (like an (html) => html postprocess function).
	 *
	 * By default the options are 'block', 'inline', 'no-pre', 'no-code', and 'noop'.
	 *
	 * The preprocessor will automatically use 'inline' for inline code like `<!-- shiki-ts shiki-ts -->` and 'block' for code fenced declarations wrapped with `<!-- shiki-start shiki-end -->`.
	 *
	 * Define your own transforms or redefine the defaults here.
	 *
	 * To call them, write the `transformMap` `key` as the first line after the `<!-- shiki-start` delimiter.
	 *
	 * For example, this will use `transformMap['foo']` if it exists, and default to `transformMap['block']` if it's not found.
	 *
	 * ~~~md
	 * <!-- shiki-start
	 * t-foo
	 * ```ts
	 * const foo = "bar";
	 * ```
	 * shiki-end -->
	 * ~~~
	 */
	transformMap: Record<
		string,
		{
			addDefaultProps?: (a: {
				lang: string;
				transformName: string;
				mut_pre: Partial<PropertyArrays>;
				mut_code: Partial<PropertyArrays>;
				mut_allLines: Partial<PropertyArrays>;
			}) => void;
			transforms?: ShikiTransformer[];
		}
	>;

	/**
	 * Because the preprocessor runs inside an HTML comment, you'll need a way to escape from those delimiters.
	 *
	 * By default, write `&openhtmlcomment;` and `&closehtmlcoomment;` to write `<!--` and `-->`
	 */
	escapePreprocessor: ({ code }: { code: string }) => string;
	/**
	 * The preprocessor turns commented code which Svelte can handle into raw html, which may be problematic.
	 * `escapeSvelte` gives you a final chance to modify the HTML before Svelte sees it.
	 * By default, it replaces `{` with `&lbrace;` and `}` with `&rbrace;`
	 */
	escapeSvelte: ({ highlightedHtml }: { highlightedHtml: string }) => string;
};

export type CreateHighlighterArgs = {
	theme?: { bundled?: BundledTheme[]; custom?: ThemeInput[] };
	lang?: { bundled?: BundledLanguage[]; custom?: LanguageInput[] };
};

/**
 * Customize the preprocessor and highlighter by passing `await getOrLoadOpts(opts: CreateOptsArgs)` into `processCodeblockSync`.
 */
export type CreateOptsArgs = {
	/**
	 * Load shiki default themes and langs or provide custom definitions.
	 *
	 * By default, the shiki `Rosé Pine Dawn` theme maps to the css variable `--h-light` and a custom `Darker` theme maps to `--h-dark`.
	 *
	 * Note that 'light' and 'dark' are not special names. Any valid css variable will work.
	 *
	 * Loaded default langs: 'svelte', 'diff', 'json', 'sh', and 'sql'.
	 *
	 * Note that each shiki bundled language may include others. For example, 'svelte' includes 'ts', 'js', 'html', 'css', etc.
	 */
	highlighter?: { cssVarToThemeName?: Record<string, string> } & (
		| { core?: HighlighterCore; theme?: never; lang?: never }
		| ({ core?: never } & CreateHighlighterArgs)
	);
	/**
	 * The common delimiter. Defaults to `shiki-` which can be detected by the accompanying VS Code extension.
	 *
	 * For example, this prefixes the fenced blocks `<!-- shiki-start shiki-end -->` as well as every inline language, for example `<!-- shiki-ts shiki-ts -->`
	 */
	delimiter?: string;
} & Partial<Omit<HighlightOpts, 'highlighterCore' | 'cssVarToThemeName'>>;

/**
 * For use when calling the preprocessor programmatically without `processCodeblockSync`
 *
 * The preprocessor looks at comments and if it doesn't see the common prefix, it immediately returns.
 *
 * Then it checks if it ends with a fence.
 * If so, it strips the options from the code (inline and before fence) and passes them to the highlighter.
 * It defaults the wrapper to 'block' which is by default a no-op.
 *
 * If it doesn't see a fence, it tries each of the inline delimiters, and upon finding one, passes that language and 'inline' wrapper to the highlighter.
 */
export type PreprocessOpts = HighlightOpts & {
	delimiters: {
		common: string;
		inline: Array<{ delimiter: string; delimLoc: { start: number; end: number }; lang: string }>;
		fenced: { start: string; end: string; startLoc: number; endLoc: number };
	};
};

export type Logger = {
	error?: (e: Error, filename: string) => void;
	warn?: (e: Error, filename: string) => void;
	info?: (detail: { count: number }, filename: string) => void;
};
