import { defineContext } from '$lib/utils/client';

const [getService, setService] = defineContext<{ flag: boolean }>();

const createTurnstileLoadedFlag = () => {
	const flag = $state({ flag: typeof window === 'undefined' ? false : 'turnstile' in window });
	setService(flag);
};

export { createTurnstileLoadedFlag, getService as useTurnstileLoadedFlag };
