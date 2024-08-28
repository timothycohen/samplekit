import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';

const codeBlockCss = import('/src/lib/styles/css/code.css?raw')
	.then(({ default: rawCode }) =>
		codeToDecoratedHtmlSync({
			lang: 'css',
			code: rawCode,
			opts,
			transformName: 'block',
		}),
	)
	.then((res) => {
		const data = res.data;
		if (!data) throw new Error('Failed to parse code block');
		return data;
	});

export const load = async () => {
	return { codeBlockCss };
};
