import { createClientFetch } from '$lib/http/client';
import type { RouteId } from './$types';

export type Lang = 'EN' | 'DE' | 'KO';
export const langs = ['EN', 'DE', 'KO'] satisfies Lang[];
export type PostReq = { lang: (typeof langs)[number]; excludeColor: string; simulateDelay?: boolean };
export type PostRes = { color: string };

export const getRandomColor = createClientFetch<RouteId, PostRes, PostReq>(
	'POST',
	'/articles/typesafe-fetch-handler/live-demos/main',
);

export const isValidLang = (lang: unknown): lang is Lang => {
	if (typeof lang !== 'string') return false;
	return langs.includes(lang as Lang);
};

export const langOptions = {
	language: [
		{ value: { lang: 'EN' }, label: 'English' },
		{ value: { lang: 'DE' }, label: 'Deutsch' },
		{ value: { lang: 'KO' }, label: '한국어' },
	],
} as const satisfies { language: Array<{ value: { lang: Lang }; label: string }> };

export const defaultLang = langOptions.language[0];
