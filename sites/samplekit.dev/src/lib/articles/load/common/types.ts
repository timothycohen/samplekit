import type { LayoutRouteId } from '../../../../routes/articles/$types';

type Replace<
	T extends string,
	S extends string,
	D extends string,
	A extends string = '',
> = T extends `${infer L}${S}${infer R}` ? Replace<R, S, D, `${A}${L}${D}`> : `${A}${T}`;

type _ArticleSlug = Replace<Exclude<LayoutRouteId, '/articles'>, '/articles/', ''>;
export type ArticleSlug = _ArticleSlug extends never ? '' : _ArticleSlug;

export type SvelteFileName = `${string}.svelte`;
export const isSvelteFile = (file: string): file is `${string}.svelte` => file.endsWith('.svelte');
