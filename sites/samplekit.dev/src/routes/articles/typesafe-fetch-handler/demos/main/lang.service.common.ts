export type Lang = 'EN' | 'DE' | 'KO';
export const langs = ['EN', 'DE', 'KO'] as const satisfies readonly Lang[];

export const langOptions = {
	language: [
		{ value: { lang: 'EN' }, label: 'English' },
		{ value: { lang: 'DE' }, label: 'Deutsch' },
		{ value: { lang: 'KO' }, label: '한국어' },
	],
} as const satisfies { language: Array<{ value: { lang: Lang }; label: string }> };

export const defaultLang = langOptions.language[0];

export const isSupportedLang = (lang: unknown): lang is Lang => {
	if (typeof lang !== 'string') return false;
	return langs.includes(lang as Lang);
};
