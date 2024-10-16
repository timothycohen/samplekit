import { CookieClientStorage } from '$lib/svelte-runes/storage.svelte';
import { defineCtx } from '$lib/utils/client';

class Svelte45Controller {
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

const [getCtx, setCtx] = defineCtx<Svelte45Controller>();
const createSvelte45Ctx = (hydrationValue: 4 | 5) => setCtx(new Svelte45Controller(hydrationValue));
const useSvelte45Ctx = getCtx;
export { createSvelte45Ctx, useSvelte45Ctx };
