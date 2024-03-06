import { writable } from 'svelte/store';

export const createTempStore = <StoreVal, BeforeFinishCBReturn = void>({
	duration,
	beforeFinishCb,
}: {
	duration: number;
	beforeFinishCb?: (val: StoreVal) => BeforeFinishCBReturn;
}) => {
	const store = writable<StoreVal | null>(null);
	let timeout: ReturnType<typeof setTimeout>;

	const set = (val: StoreVal) => {
		clearInterval(timeout);
		store.set(val);
		timeout = setTimeout(() => {
			beforeFinishCb?.(val);
			store.set(null);
		}, duration);
	};

	const clear = () => {
		clearInterval(timeout);
		store.set(null);
	};

	return {
		subscribe: store.subscribe,
		set,
		clear,
	};
};

export type TempStore = ReturnType<typeof createTempStore>;
