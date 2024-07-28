import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { parse } from 'svelte/compiler';
import { getOrLoadOpts } from './defaultOpts.js';
import { codeToDecoratedHtmlSync } from './highlight.js';
import { stripOptions } from './stripOptions/index.js';
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
							tranName,
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

/**
 * Uses the preprocessor with default options.
 *
 * Must use `await` to initiate the highlighter.
 *
 * If you plan on reusing the same highlighter programmatically using `codeToDecoratedHtmlSync`, `highlighterCore.codeToHtml`, etc. you can instead create the opts separately and pass them to `processCodeblockSync`.
 *
 * Example
 * ```js
 * await processCodeblock({
 * 	include: (filename) => filename.startsWith(preprocessorRoot),
 * 	logger: createShikiLogger((filename) => filename.replace(preprocessorRoot, '')),
 * }),
 * ```
 *
 * Or
 *
 * ```js
 * processCodeblockSync({
 * include: (filename) => filename.startsWith(preprocessorRoot),
 * 	logger: createShikiLogger((filename) => filename.replace(preprocessorRoot, '')),
 * 	opts: await getOrLoadOpts({ lang: { bundled: ['sql'] }, cssVarPrefix: '--v', delimiter: 'shi-' }),
 * }),
 * ```
 *
 */
export async function processCodeblock({
	include,
	logger,
}: {
	include?: (filename: string) => boolean;
	logger?: Logger;
}) {
	return processCodeblockSync({ include, logger, opts: await getOrLoadOpts() });
}
