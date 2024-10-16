import { defineCtx } from '$lib/svelte-context';

const [getCtx, setCtx] = defineCtx<{ flag: boolean }>();

const createTurnstileLoadedFlag = () => {
	const flag = $state({ flag: typeof window === 'undefined' ? false : 'turnstile' in window });
	setCtx(flag);
};

export { createTurnstileLoadedFlag, getCtx as useTurnstileLoadedFlag };
