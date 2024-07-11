import { walk } from 'estree-walker';
import katex from 'katex';
import MagicString from 'magic-string';
import { parse, type SvelteNode, type PreprocessorGroup } from 'svelte/compiler';

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
		const unicodePlacholder = unicodeInsertionPlaceholders[index];
		index++;
		return `{` + unicodePlacholder + `}`;
	});

	return { svelteFreeString, extractedSvelteContent };
}

function restoreSvelte(mathString: string, extractedSvelteContent: string[]): string {
	if (!extractedSvelteContent.length) return mathString;

	const unicodeMap = new Map();
	extractedSvelteContent.forEach((content, i) => {
		unicodeMap.set(unicodeInsertionPlaceholders[i], content);
	});

	const unicodePlacholderRegex = new RegExp(`(${unicodeInsertionPlaceholders.join('|')})`, 'g');

	return mathString.replaceAll(unicodePlacholderRegex, (placeholder) => {
		const svelteContent = unicodeMap.get(placeholder);
		return `\${${svelteContent}}`;
	});
}

export function processKatex({
	include,
	logger,
	renderToString = katex.renderToString,
}: {
	include?: (filename: string) => boolean;
	logger?: {
		error?: (s: string) => void;
		debug?: (s: string) => void;
		formatFilename?: (filename: string) => string;
	};
	renderToString?: (tex: string, options?: katex.KatexOptions) => string;
} = {}): PreprocessorGroup {
	return {
		name: 'katex',
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

					let displayMode: boolean | undefined = undefined;
					if (trimmed.startsWith(display.start) && trimmed.endsWith(display.end)) displayMode = true;
					else if (trimmed.startsWith(inline.start) && trimmed.endsWith(inline.end)) displayMode = false;
					if (displayMode === undefined) return;

					s.remove(node.start, node.end);

					let parsed;
					try {
						const rawInput = String.raw`${trimmed.slice(delimLoc.start, delimLoc.end)}`;
						const { svelteFreeString, extractedSvelteContent } = replaceSvelteAndStore(rawInput);
						const logs: string[] = [];
						catchStdErr({
							trappedFn: () => {
								const mathString = renderToString(svelteFreeString, {
									displayMode,
									throwOnError: true,
									strict: (errorCode: string, errorMsg: string) => {
										if (errorCode === 'unknownSymbol' && errorMsg.startsWith('Unrecognized Unicode character'))
											return 'ignore';
									},
								});
								parsed = restoreSvelte(mathString, extractedSvelteContent);
							},
							tmpWrite: (str) => {
								if (!str.startsWith('No character metrics for ')) logs.push(str);
								return true;
							},
						});
						if (logger?.error) {
							logs.forEach((msg) => {
								logger.error?.(
									`[PREPROCESS] | Math | Error | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${msg}`,
								);
							});
						}
					} catch (err) {
						if (logger?.error) {
							const msg = err instanceof Error ? err.message : 'Failed to render KaTeX.';
							logger.error(
								`[PREPROCESS] | Math | Error | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${msg}`,
							);
						}
						return;
					}
					const content = displayMode
						? `<div class="overflow-x-auto">{@html \`${parsed}\`}</div>`
						: `{@html \`${parsed}\`}`;
					s.appendLeft(node.start, content);
					count++;
				},
			});

			if (logger && count) {
				const msg = `{ count: ${count} }`;
				logger.debug?.(
					`[PREPROCESS] | Math | Success | ${logger.formatFilename ? logger.formatFilename(filename) : filename} | ${msg}`,
				);
			}

			return { code: s.toString() };
		},
	};
}
