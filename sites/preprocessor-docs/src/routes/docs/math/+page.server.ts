import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';

const jsTemplateLiteralExampleInner = codeToDecoratedHtmlSync({
	transformName: 'no-code',
	lang: 'latex',
	opts,
	code: `	x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}`,
}).data!;

const jsTemplateLiteralExample = codeToDecoratedHtmlSync({
	transformName: 'block',
	lang: 'ts',
	opts,
	code: `const eq1 = LaTeX\`
REPLACEME
\`;`,
}).data!.replace(/^(<pre[^>]*><code[^>]*>.*\n).*(.*)/, `$1${jsTemplateLiteralExampleInner}$2`)!;

export const load = async () => {
	return { jsTemplateLiteralExample };
};
