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
						const { svelteFreeString, extractedSvelteContent } = replaceSvelteAndStore(rawInput);
						const warns: Error[] = [];
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
