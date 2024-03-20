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
