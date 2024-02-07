import { tweened, type TweenedOptions } from 'svelte/motion';
import { get, writable, type Unsubscriber } from 'svelte/store';

export function createPausableTweened(
	initial: number = 0,
	final: number = 100,
	options: TweenedOptions<number> & { duration: number } = { duration: 500 },
) {
	const store = tweened(initial, options);
	const isPaused = writable(true);
	const isFinished = writable(false);

	const play = () => {
		const value = get(store);
		if (value === final) return;

		const completedPerc = (value - initial) / (final - initial);
		const remaining = options.duration - options.duration * completedPerc;

		isPaused.set(false);
		return store.set(final, { duration: remaining });
	};

	const pause = () => {
		const value = get(store);
		if (value === final) return;

		isPaused.set(true);
		return store.set(value, { duration: 0 });
	};

	const reset = () => {
		isPaused.set(true);
		return store.set(initial, { duration: 0 });
	};

	const restart = () => {
		store.set(initial, { duration: 0 });
		isPaused.set(false);
		return store.set(final, options);
	};

	const toggle = () => {
		const value = get(isPaused);
		return value ? play() : pause();
	};

	const unsubscribers: Unsubscriber[] = [];

	unsubscribers.push(
		store.subscribe((v) => {
			if (v === final) {
				isFinished.set(true);
			} else {
				isFinished.set(false);
			}
		}),
	);

	const destroy = () => {
		unsubscribers.forEach((u) => u());
	};

	return {
		value: { subscribe: store.subscribe },
		isPaused: { subscribe: isPaused.subscribe },
		isFinished: { subscribe: isFinished.subscribe },
		pause,
		reset,
		play,
		toggle,
		restart,
		initial,
		final,
		destroy,
	};
}

export type PausableTweened = ReturnType<typeof createPausableTweened>;
