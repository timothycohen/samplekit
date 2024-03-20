import { mdCodeBlockToRawHtml } from '@samplekit/markdown';

const codeBlockCss = import('/src/lib/styles/css/code-block.css?raw').then(
	({ default: rawCode }) => mdCodeBlockToRawHtml({ lang: 'css', rawCode }).data,
);

export const load = async () => {
	return { codeBlockCss };
};
