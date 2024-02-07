// Credit: https://www.reddit.com/r/sveltejs/comments/szc481/comment/i8hik7c/?utm_source=share&utm_medium=web2x&context=3

import { setContext, getContext } from 'svelte';

function set<T>(key: string | symbol, service: T): T {
	setContext(key, service);
	return service;
}

function get<T>(key: string | symbol): () => T {
	return () => getContext(key) as T;
}

export function defineContext<T>(key: string | symbol = Symbol()): [() => T, (service: T) => T] {
	return [
		get<T>(key),
		(service: T) => {
			set(key, service);
			return service;
		},
	];
}
