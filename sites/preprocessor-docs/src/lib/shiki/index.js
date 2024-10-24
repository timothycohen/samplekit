import { getOrLoadOpts, codeToDecoratedHtmlSync, updateOpts, defaultTransformMap } from '@samplekit/preprocess-shiki';

const opts = await getOrLoadOpts({
	highlighter: {
		lang: { bundled: ['svelte', 'js', 'ts', 'html', 'css', 'latex', 'md', 'sh'] },
		theme: { bundled: ['rose-pine-dawn', 'catppuccin-latte'] },
		cssVarToThemeName: { daffodil: 'rose-pine-dawn', dark: 'darker', bellflower: 'catppuccin-latte' },
	},
});

/**
 * @param {string} punctuation1
 * @param {string} keyword1
 * @param {string} keyword2
 * @param {string} punctuation2
 */
const createBlockWrapper = (punctuation1, keyword1, keyword2, punctuation2) => {
	const data = codeToDecoratedHtmlSync({
		lang: 'ts',
		opts,
		transformName: 'block',
		code: `REPLACESTART()await
SPLITINNER
await REPLACEEND()`,
	}).data;

	if (!data) throw new Error('codeToDecoratedHtmlSync');

	const [start, end] = data
		.replace(
			/(.*)REPLACESTART.*<span[^>]*>\(\)(.*)await(.*\n).*<\/span><\/span>.*\n(.*)await(.*)REPLACEEND<\/span><span[^>]*>\(\)(.*)/,
			(_, untilPunctuation1, untilKeyword1, untilSplit, untilKeyword2, untilPunctuation2, untilEnd) => {
				return (
					untilPunctuation1 +
					punctuation1 +
					untilKeyword1 +
					keyword1 +
					untilSplit +
					`SPLITINNER\n` +
					untilKeyword2 +
					keyword2 +
					untilPunctuation2 +
					punctuation2 +
					untilEnd
				);
			},
		)
		.split('SPLITINNER');

	if (!start || !end) throw new Error('regex failed');
	return { start, end };
};

/**
 * @param {string} punctuation1
 * @param {string} keyword1
 * @param {string} keyword2
 * @param {string} punctuation2
 */
const createSameLineWrapper = (
	punctuation1,
	keyword1,
	keyword2,
	punctuation2,
	/** @type {{transformName: string}} */ { transformName },
) => {
	const data = codeToDecoratedHtmlSync({
		preProperties: { classes: ['no-lines'] },
		lang: 'ts',
		opts,
		transformName,
		code: `REPLACESTART()await
SPLITINNER
await REPLACEEND()`,
	}).data;

	if (!data) throw new Error('codeToDecoratedHtmlSync');

	const [start, end] = data
		.replace(
			/(.*)REPLACESTART.*<span[^>]*>\(\)(.*)await(.*)\n.*<\/span><\/span>.*\n(.*>).*await(.*)REPLACEEND<\/span><span[^>]*>\(\)(.*)/,
			(_, untilPunctuation1, untilKeyword1, untilSplit, untilKeyword2, untilPunctuation2, untilEnd) => {
				return (
					untilPunctuation1 +
					punctuation1 +
					untilKeyword1 +
					keyword1 +
					untilSplit +
					`SPLITINNER` +
					untilKeyword2 +
					keyword2 +
					untilPunctuation2 +
					punctuation2 +
					untilEnd
				);
			},
		)
		.split('SPLITINNER');

	if (!start || !end) throw new Error('regex failed');
	return { start, end };
};

const shikiBlock = createBlockWrapper('&lt;!--', ' shiki-start', 'shiki-end', '--&gt;');
const mdBlock = createBlockWrapper('&lt;!--', ' md-start', 'md-end', '--&gt;');
const katexBlock = createBlockWrapper('&lt;!--', ' \\[', '\\]', '--&gt;');
const shikiTsBlock = createSameLineWrapper('&lt;!-- ', 'shiki-ts ', ' shiki-ts', '--&gt;', { transformName: 'block' });
const shikiTsInline = createSameLineWrapper('&lt;!-- ', 'shiki-ts ', ' shiki-ts', '--&gt;', {
	transformName: 'inline',
});
const commentInline = createSameLineWrapper('&lt;!-- ', '', '', '--&gt;', { transformName: 'inline' });
const commentBlock = createSameLineWrapper('&lt;!--', '', '', '--&gt;', { transformName: 'block' });

updateOpts((oldOpts) => {
	if (!oldOpts) return oldOpts;

	opts.transformMap['shiki-block'] = {
		addDefaultProps: defaultTransformMap['block']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return shikiBlock.start + middle + shikiBlock.end;
				},
			},
		],
	};

	opts.transformMap['md-block'] = {
		addDefaultProps: defaultTransformMap['block']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return mdBlock.start + middle + mdBlock.end;
				},
			},
		],
	};

	opts.transformMap['katex-block'] = {
		addDefaultProps: defaultTransformMap['block']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return katexBlock.start + middle + katexBlock.end;
				},
			},
		],
	};

	opts.transformMap['shiki-ts-block'] = {
		addDefaultProps: defaultTransformMap['block']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return shikiTsBlock.start + middle + shikiTsBlock.end;
				},
			},
		],
	};

	opts.transformMap['shiki-ts-inline'] = {
		addDefaultProps: defaultTransformMap['inline']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return shikiTsInline.start + middle + shikiTsInline.end;
				},
			},
		],
	};

	opts.transformMap['comment-inline'] = {
		addDefaultProps: defaultTransformMap['inline']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return commentInline.start + middle + commentInline.end;
				},
			},
		],
	};

	opts.transformMap['comment-block'] = {
		addDefaultProps: defaultTransformMap['block']['addDefaultProps'],
		transforms: [
			{
				postprocess: (html) => {
					const middle = html.replace(/^<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>$/, '$1');
					return commentBlock.start + middle + commentBlock.end;
				},
			},
		],
	};

	opts.escapePreprocessor = ({ code }) =>
		code.replace(/&openhtmlcomment;|&closehtmlcomment;|&tripgrave;/g, (match) => {
			const res = {
				'&openhtmlcomment;': '<!--',
				'&closehtmlcomment;': '-->',
				'&tripgrave;': '```',
			}[match];
			return res ?? ''; // unreachable. can't use ! in js files
		});

	return opts;
});

export { opts };
