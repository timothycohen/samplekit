import { CookieClientStorage } from '$lib/svelte-runes/storage.svelte';

export class Svelte45Controller {
	#prefers = $state() as 4 | 5;
	#storage: CookieClientStorage<'svelte-4-5'>;

	constructor(hydrationValue: 4 | 5) {
		this.#prefers = hydrationValue === 4 ? 4 : 5;
		this.#storage = new CookieClientStorage();
	}

	get prefers() {
		return this.#prefers;
	}
	set prefers(value: 4 | 5) {
		this.#prefers = value;
		this.#storage.set('svelte-4-5', String(value));
	}
}
