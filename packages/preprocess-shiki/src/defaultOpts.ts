import { createHighlighterCore } from '@shikijs/core';
import type { BundledLanguage, CreateHighlighterArgs, CreateOptsArgs, PreprocessOpts } from './types.js';
// 'shiki' langs and themes are dynamically imported

export const defaultBundledLangNames = [
	'svelte',
	'js',
	'ts',
	'html',
	'css',
	'md',
	'diff',
	'json',
	'sh',
	'sql',
] satisfies BundledLanguage[];

export const defaultCssVarToThemeName = { dark: 'darker', light: 'rose-pine-dawn' };

export const defaultcssVarPrefix = '--h-';

export const defaultCommonDelimiter = 'shiki-';

export const defaultTransformMap = {
	block: {
		addDefaultProps: ({ mut_allLines, lang, mut_pre }) => {
			mut_pre.datas = ['shiki', `shiki-lang-${lang}`, 'shiki-t-block', ...(mut_pre.datas ?? [])];
			mut_allLines.datas = ['line', ...(mut_allLines.datas ?? [])];
		},
	},
	inline: {
		addDefaultProps: ({ lang, mut_pre }) => {
			mut_pre.datas = ['shiki', `shiki-lang-${lang}`, 'shiki-t-inline', ...(mut_pre.datas ?? [])];
		},
	},
	'no-pre': {
		addDefaultProps: ({ mut_allLines, mut_code, lang }) => {
			mut_code.datas = ['shiki', `shiki-lang-${lang}`, 'shiki-t-no-pre', ...(mut_code.datas ?? [])];
			mut_allLines.datas?.push('line');
		},
		transforms: [{ postprocess: (html) => html.replace(/^<pre[^>]*>(<code[^>]*>[\s\S]*?<\/code>)<\/pre>$/, '$1') }],
	},
	'no-code': {
		transforms: [
			{ postprocess: (html: string) => html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1') },
		],
	},
	noop: {},
} satisfies PreprocessOpts['transformMap'];

export const defaultEscapePreprocessor = (({ code }) =>
	code.replace(/&openhtmlcomment;|&closehtmlcomment;/g, (match) => {
		return {
			'&openhtmlcomment;': '<!--',
			'&closehtmlcomment;': '-->',
		}[match]!;
	})) satisfies ({ code }: { code: string }) => string;

export const defaultEscapeSvelte = (({ highlightedHtml }) =>
	highlightedHtml.replace(/[{}]/g, (match) => {
		return { '{': '&lbrace;', '}': '&rbrace;' }[match]!;
	})) satisfies ({ highlightedHtml }: { highlightedHtml: string }) => string;

const createDefaultHighlighter = async (a?: CreateHighlighterArgs) => {
	const langs = [
		...(a?.lang?.custom ?? []),
		...(a?.lang?.bundled ?? defaultBundledLangNames).map((l) => import(`../node_modules/shiki/dist/langs/${l}.mjs`)),
	];

	const themes = [
		...(a?.theme?.custom ?? [import('./themes/darker.js')]),
		...(a?.theme?.bundled?.map((t) => import(`../node_modules/shiki/dist/themes/${t}.mjs`)) ?? [
			import('shiki/themes/rose-pine-dawn.mjs'),
		]),
	];

	return await createHighlighterCore({ themes, langs, loadWasm: import('shiki/wasm') });
};

const createDelimiters = (a: { delimiter?: string; loadedLanguages: string[] }) => {
	const commonDelimiter = a?.delimiter ?? defaultCommonDelimiter;
	const inlineDelimiter = a.loadedLanguages.map((lang) => {
		const delimiter = `${commonDelimiter}${lang}`;
		const delimLoc = { start: delimiter.length + 1, end: -delimiter.length - 1 };
		return { delimiter, delimLoc, lang };
	});
	const fencedDelimiter = (() => {
		const start = `${commonDelimiter}start`;
		const end = `${commonDelimiter}end`;
		const startLoc = start.length + 1;
		const endLoc = -end.length - 1;
		return { start, end, startLoc, endLoc };
	})();
	return {
		common: commonDelimiter,
		inline: inlineDelimiter,
		fenced: fencedDelimiter,
	};
};

const load = async (a?: CreateOptsArgs): Promise<PreprocessOpts> => {
	const highlighterCore = a?.highlighter?.core ?? (await createDefaultHighlighter(a?.highlighter));

	return {
		cssVarToThemeName: a?.highlighter?.cssVarToThemeName ?? defaultCssVarToThemeName,
		cssVarPrefix: a?.cssVarPrefix ?? defaultcssVarPrefix,
		delimiters: createDelimiters({
			delimiter: a?.delimiter,
			loadedLanguages: highlighterCore.getLoadedLanguages(),
		}),
		escapePreprocessor: a?.escapePreprocessor ?? defaultEscapePreprocessor,
		escapeSvelte: a?.escapeSvelte ?? defaultEscapeSvelte,
		highlighterCore,
		transformMap: a?.transformMap ?? defaultTransformMap,
	};
};

let opts: PreprocessOpts | null = null;

export const getOrLoadOpts = async (a?: CreateOptsArgs, hotModuleRefresh?: true) => {
	if (opts && !hotModuleRefresh) return opts;
	opts = await load(a);
	return opts;
};

export const updateOpts = (updater: (oldOpts: PreprocessOpts | null) => PreprocessOpts | null) => {
	opts = updater(opts);
};
