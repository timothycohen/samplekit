import { get, writable, type Readable, type Writable } from 'svelte/store';

export const createIndexStore = ({
	itemsLength,
	index,
	onChange,
}: {
	itemsLength: number | Readable<number>;
	index?: Writable<number>;
	onChange?: (i: number) => void;
}) => {
	const store = index ?? writable(0);

	const len = () => (typeof itemsLength === 'number' ? itemsLength : get(itemsLength));

	const inc = () => {
		const i = get(store);
		const newVal = i === len() - 1 ? 0 : i + 1;
		store.set(newVal);
		onChange?.(i);
		return newVal;
	};

	const dec = () => {
		const i = get(store);
		const newVal = i === 0 ? len() - 1 : i - 1;
		store.set(newVal);
		onChange?.(i);
		return newVal;
	};

	const set = (i: number) => {
		const newVal = Math.max(0, Math.min(i, len() - 1));
		store.set(newVal);
		onChange?.(i);
		return newVal;
	};

	const update = (fn: (i: number) => number) => {
		const i = get(store);
		const newVal = fn(i);
		store.set(newVal);
		onChange?.(i);
		return newVal;
	};

	return { subscribe: store.subscribe, update, set, inc, dec };
};

export type IndexStore = ReturnType<typeof createIndexStore>;
