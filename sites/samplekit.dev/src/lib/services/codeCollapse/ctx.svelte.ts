import { defineContext } from '$lib/utils/client';
import { BoolService } from '../primitives.svelte';

const [getService, setService] = defineContext<BoolService>();

const createCollapsedService = (initial: boolean) => {
	return setService(new BoolService(initial));
};

export { createCollapsedService, getService as useCollapsedService };
