import { defineCtx } from '$lib/svelte-context';
import { BoxedBool } from '$lib/svelte-runes/primitives.svelte';

const [getCtx, setCtx] = defineCtx<BoxedBool>();

const createCollapsedService = (initial: boolean) => {
	return setCtx(new BoxedBool(initial));
};

export { createCollapsedService, getCtx as useCollapsedService };
