import { tweened, type Tweened } from 'svelte/motion';
import { browser } from '$app/environment';

export type PausableTweenedProps = {
	initial?: number;
	final?: number;
	duration?: number;
	delay?: number;
	playOnStart?: boolean;
	easing?: (t: number) => number;
	interpolate?: (a: number, b: number) => (t: number) => number;
	onFinish?: (self: PausableTweened) => void;
};

export const pausableTweenedPropsDefaults = {
	initial: 0,
	final: 100,
	duration: 5000,
	delay: 0,
	playOnStart: true,
} satisfies PausableTweenedProps;

export class PausableTweened {
	#initial: number;
	#final = 100;
	#options: {
		duration: number;
		delay?: number;
		easing?: (t: number) => number;
		interpolate?: (a: number, b: number) => (t: number) => number;
	};
	#isPaused = $state() as boolean;
	#value = $state() as number;
	#tween: Tweened<number>;
	#isFinished = $derived(this.#value === this.#final);

	get value() {
		return this.#value;
	}
	get isPaused() {
		return this.#isPaused;
	}
	get final() {
		return this.#final;
	}
	get initial() {
		return this.#initial;
	}
	get isFinished() {
		return this.#isFinished;
	}

	play = () => {
		if (this.#value === this.#final) return;

		const completedPerc = (this.#value - this.#initial) / (this.#final - this.#initial);
		const remaining = this.#options.duration - this.#options.duration * completedPerc;

		this.#isPaused = false;
		return this.#tween.set(this.#final, { duration: remaining });
	};

	pause = () => {
		this.#isPaused = true;
		return this.#tween.set(this.#value, { duration: 0 });
	};

	reset = () => {
		this.#isPaused = true;
		return this.#tween.set(this.#initial, { duration: 0 });
	};

	restart = () => {
		this.#isPaused = false;
		this.#tween.set(this.#initial, { duration: 0 });
		return this.#tween.set(this.#final, this.#options);
	};

	goToInitial = () => {
		if (this.isPaused) this.reset();
		else this.restart();
	};

	goToFinal = () => {
		return this.#tween.set(this.#final, { duration: 0 });
	};

	toggle = () => {
		return this.#isPaused ? this.play() : this.pause();
	};

	constructor(props: PausableTweenedProps = {}) {
		const p = { ...pausableTweenedPropsDefaults, ...props };
		this.#initial = p.initial;
		this.#isPaused = !p.playOnStart;
		this.#final = p.final;
		this.#options = { duration: p.duration, delay: p.delay, easing: p.easing, interpolate: p.interpolate };
		this.#tween = tweened(this.#initial, this.#options);
		this.#value = this.#initial;
		$effect(() => this.#tween.subscribe((v) => (this.#value = v)));
		if (!this.#isPaused && browser) this.play();
		if (props.onFinish) {
			$effect(() => {
				if (this.#isFinished) props.onFinish?.(this);
			});
		}
	}
}
