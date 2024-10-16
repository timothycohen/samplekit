import { BoxedBool } from '$lib/svelte-runes/primitives.svelte';
import { defineCtx } from '$lib/utils/client';

const [getCtx, setCtx] = defineCtx<BoxedBool>();

const createCollapsedCtx = (initial: boolean) => {
	return setCtx(new BoxedBool(initial));
};

export { createCollapsedCtx, getCtx as useCollapsedCtx };
