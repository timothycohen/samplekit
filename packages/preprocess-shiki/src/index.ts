export {
	defaultBundledLangNames,
	defaultCssVarToThemeName,
	defaultcssVarPrefix,
	defaultCommonDelimiter,
	defaultTransformMap,
	defaultEscapePreprocessor,
	defaultEscapeSvelte,
	getOrLoadOpts,
	updateOpts,
} from './defaultOpts.js';
export { codeToDecoratedHtmlSync, codeToDecoratedHtml } from './highlight.js';
export { createShikiLogger } from './logger.js';
export { processCodeblockSync, processCodeblock } from './preprocessors.js';
export type { HighlightOpts, PreprocessOpts, Logger, CreateOptsArgs } from './types.js';
