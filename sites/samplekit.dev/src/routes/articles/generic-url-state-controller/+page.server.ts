import { mdCodeBlockToRawHtml } from '@samplekit/preprocess-shiki';

const typedVariantFiles = (() => {
	const titles = ['Shared', 'String', 'Bool And Flag', 'Number', 'Select', 'MinMax'];
	const delimiters = [
		'export const createStringParam',
		'export const createNullableBoolParam',
		'export const createNumParam',
		'export const createSelectParam',
		'const strToNum',
	];
	const pattern = new RegExp(`(${delimiters.map((delimiter) => `(?=${delimiter})`).join('|')})`);

	const rawCode = import('/src/lib/stores/params/params.ts?raw').then(({ default: rawCode }) => {
		return rawCode.split(pattern).filter((item) => item.trim() !== '');
	});

	return titles.map((title, i) => ({
		title,
		rawHTML: rawCode.then((r) => r[i]!).then((rawCode) => mdCodeBlockToRawHtml({ lang: 'ts', rawCode }).data!),
	}));
})();

export const load = async () => {
	return { typedVariantFiles };
};
