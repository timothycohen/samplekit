// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import readingTime from 'reading-time';
import { visit } from 'unist-util-visit';

// https://github.com/lubiah/mdsvex-reading-time/blob/master/src/index.ts

/**
 * Calculates the reading time of your markdown files and adds it in this format: { text: '3 min read', minutes: 2.97, time: 178200, words: 594 }
 * @param {string} [options.attribute="readingTime"] - The attribute name in the file metadata to store the reading time.
 * @param {number} [options.wpm="200"] - the words per minute an average reader can read (default is 200)
 */
const plugin = (options = {}) => {
	const config = { ...{ attribute: 'readingTime', wpm: 200 }, options };
	return (tree, file) => {
		let content = '';
		visit(tree, ['code', 'text'], (node) => {
			content += node.value;
		});
		if (!file.data.fm) file.data.fm = {};
		file.data.fm[config.attribute] = readingTime(content, { wordsPerMinute: config.wpm });
	};
};

export default plugin;
