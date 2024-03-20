import { defineContext } from '$lib/utils/client';

const [getService, setService] = defineContext<{
	onTrigger: (cb: (newState: boolean) => void) => void;
	triggerAll: (newState: boolean) => void;
}>();

const createCollapsedService = () => {
	const subscriptions: Array<(newState: boolean) => void> = [];

	const onTrigger = (cb: (newState: boolean) => void) => {
		subscriptions.push(cb);
	};

	const triggerAll = (newState: boolean) => {
		subscriptions.forEach((cb) => cb(newState));
	};

	setService({
		onTrigger,
		triggerAll,
	});
};

export { createCollapsedService, getService as useCollapsedService };
