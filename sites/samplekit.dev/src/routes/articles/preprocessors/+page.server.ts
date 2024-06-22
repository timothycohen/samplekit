import { mdCodeBlockToRawHtml } from '@samplekit/preprocess-shiki';

const codeBlockCss = import('/src/lib/styles/css/code-block.css?raw').then(({ default: rawCode }) => {
	const data = mdCodeBlockToRawHtml({ lang: 'css', rawCode }).data;
	if (!data) throw new Error('Failed to parse code block');
	return data;
});

export const load = async () => {
	return { codeBlockCss };
};
