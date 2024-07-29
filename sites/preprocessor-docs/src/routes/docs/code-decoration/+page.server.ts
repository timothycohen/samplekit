import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';

const processedCodeblockExampleInner = codeToDecoratedHtmlSync({
	lang: 'ts',
	opts,
	transformName: 'block',
	code: `console.log('hello world');\nconst highlighted = true;`,
	lineToProperties: new Map([[1, { datas: ['highlight'] }]]),
}).data!;

const processedCodeblockExample = codeToDecoratedHtmlSync({
	lang: 'html',
	preProperties: { classes: ['no-lines'] },
	transformName: 'block',
	opts,
	code: processedCodeblockExampleInner,
}).data!;

export const load = async () => {
	return { processedCodeblockExample };
};
