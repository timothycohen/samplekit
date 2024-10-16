import { BoxedBool } from '$lib/runes/primitives.svelte';
import { defineCtx } from '../defineCtx';

const [getCtx, setCtx] = defineCtx<BoxedBool>();

const createCollapsedService = (initial: boolean) => {
	return setCtx(new BoxedBool(initial));
};

export { createCollapsedService, getCtx as useCollapsedService };
