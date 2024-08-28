import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';

const typedVariantFiles = (() => {
	const titles = ['Shared', 'String', 'Bool And Flag', 'Number', 'Select', 'MinMax'] as const;
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
		rawHTML: rawCode
			.then((r) => r[i]!.trim())
			.then(
				(rawCode) =>
					codeToDecoratedHtmlSync({
						lang: 'ts',
						code: rawCode,
						opts,
						transformName: 'block',
					}).data!,
			),
	}));
})();

const rawCodeToRawHTML = async (rawCode: string) =>
	codeToDecoratedHtmlSync({
		lang: 'ts',
		code: rawCode,
		opts,
		transformName: 'block',
	}).data!;

const { paramGeneric, paramsGeneric, paramsGenericInterface } = (() => {
	const delimiters = ['const createUrl', 'interface ParamsGeneric<', 'export const createParams'];
	const pattern = new RegExp(`(${delimiters.map((delimiter) => `(?=${delimiter})`).join('|')})`);

	const rawCode = import('/src/lib/stores/params/paramsGeneric.ts?raw').then(({ default: rawCode }) => {
		return rawCode.split(pattern).filter((item) => item.trim() !== '');
	});

	return {
		paramGeneric: {
			title: 'paramGeneric.ts',
			rawHTML: rawCode.then((r) => r[1]!.trim()).then(rawCodeToRawHTML),
		},
		paramsGenericInterface: {
			title: 'paramsGeneric.ts',
			rawHTML: rawCode.then((r) => r[2]!.trim()).then(rawCodeToRawHTML),
		},
		paramsGeneric: {
			title: 'paramsGeneric.ts',
			rawHTML: rawCode.then((r) => r[3]!.trim()).then(rawCodeToRawHTML),
		},
	};
})();

export const load = async () => {
	return { typedVariantFiles, paramGeneric, paramsGeneric, paramsGenericInterface };
};
