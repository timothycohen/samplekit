import { defineCtx } from '$lib/utils/client';

const [getCtx, setCtx] = defineCtx<{ flag: boolean }>();

const createTurnstileLoadedFlagCtx = () => {
	const flag = $state({ flag: typeof window === 'undefined' ? false : 'turnstile' in window });
	setCtx(flag);
};

export { createTurnstileLoadedFlagCtx, getCtx as useTurnstileLoadedFlagCtx };
