import { defineMDSveXConfig } from 'mdsvex';
import remarkGfm from 'remark-gfm';
import readingTime from './scripts/markdown/readingTime.js';
import { highlight } from './scripts/markdown/shikiji/highlighter.js';

export const mdsvexConfig = defineMDSveXConfig({
	extensions: ['.svx'],
	remarkPlugins: [remarkGfm, readingTime],
	highlight,
});
