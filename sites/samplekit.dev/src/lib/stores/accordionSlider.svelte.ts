import { ActiveIndex, PausableTweened } from '$lib/stores';

//#region Props & Types
type PropsDefaults = {
	defaultActiveIndex: number;
	duration: number;
	playOnStart: boolean;
	initialParentWidth: number;
	marginPerc: number;
	gapPerc: number;
};

export const accordionSliderPropsDefaults: PropsDefaults = {
	defaultActiveIndex: 0,
	duration: 15000,
	playOnStart: true,
	initialParentWidth: 768,
	gapPerc: 5,
	marginPerc: 10,
};

type PropsRequired = { itemsLength: number };

export type AccordionSliderProps = Partial<PropsDefaults> & PropsRequired;
//#endregion Props & Types

export class AccordionSlider {
	#index: ActiveIndex;
	#progress: PausableTweened;
	#parentWidth = $state() as number;
	#marginPerc = $state() as number;
	#gapPerc = $state() as number;
	#itemWidthPerc = $derived(100 - 2 * (this.#marginPerc + this.#gapPerc));
	#moving = $state() as boolean;
	#calcTransformXPerc = ({ activeIndex }: { activeIndex: number }) => {
		return this.#marginPerc + this.#gapPerc - activeIndex * (this.#itemWidthPerc + this.#gapPerc);
	};
	#transformXPerc = $derived.by(() => this.#calcTransformXPerc({ activeIndex: this.#index.active }));
	#movingTransformXPerc = $state(null) as number | null;

	constructor(props: AccordionSliderProps) {
		const p = { ...accordionSliderPropsDefaults, ...props };
		this.#index = new ActiveIndex({ max: p.itemsLength, active: p.defaultActiveIndex });
		this.#parentWidth = p.initialParentWidth;
		this.#marginPerc = p.marginPerc;
		this.#gapPerc = p.gapPerc;
		this.#moving = false;
		this.#progress = new PausableTweened({
			initial: 0,
			final: 100,
			duration: p.duration,
			playOnStart: p.playOnStart,
			onFinish: (self) => {
				this.#index.inc();
				self.restart();
			},
		});
	}

	#swipeOnTouchstartHandleMove = (e: TouchEvent): void => {
		const touch = e.touches[0];
		if (!touch) return;

		const { clientX: startX } = touch;
		let wasPaused: boolean | null = null;

		const move = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (!touch) return;
			this.#moving = true;

			if (wasPaused === null) wasPaused = this.#progress.isPaused;
			this.#progress.pause();

			const { clientX: moveX } = touch;
			const diffPerc = ((moveX - startX) / this.#parentWidth) * 100;
			const prev = this.#calcTransformXPerc({ activeIndex: this.#index.active }) - 0.5 * this.#itemWidthPerc;
			const next = this.#calcTransformXPerc({ activeIndex: this.#index.active }) + 0.5 * this.#itemWidthPerc;
			this.#movingTransformXPerc = Math.max(
				Math.min(this.#calcTransformXPerc({ activeIndex: this.#index.active }) + diffPerc, next),
				prev,
			);
		};

		const end = (e: TouchEvent) => {
			const touch = e.changedTouches[0];
			if (!touch) return;
			this.#moving = false;

			if (wasPaused !== true) this.#progress.play();
			wasPaused = null;

			const { clientX: endX } = touch;
			const diffPerc = ((endX - startX) / this.#parentWidth) * 100;
			const thresholdPerc = 0.25 * this.#itemWidthPerc;

			this.#movingTransformXPerc = null;
			if (diffPerc < -thresholdPerc) {
				this.#progress.goToInitial();
				this.#index.inc();
			} else if (diffPerc > thresholdPerc) {
				this.#progress.goToInitial();
				this.#index.dec();
			}
			window.removeEventListener('touchmove', move);
			window.removeEventListener('touchend', end);
		};

		window.addEventListener('touchmove', move);
		window.addEventListener('touchend', end);
	};

	//#region Getters/Setters
	get activeIndex() {
		return this.#index.active;
	}
	get moving() {
		return this.#moving;
	}
	get progress() {
		return this.#progress.value;
	}
	get isPaused() {
		return this.#progress.isPaused;
	}
	get marginPerc() {
		return this.#marginPerc;
	}
	set marginPerc(value: number) {
		this.#marginPerc = value;
	}
	get gapPerc() {
		return this.#marginPerc;
	}
	set gapPerc(value: number) {
		this.#gapPerc = value;
	}
	//#endregion Getters/Setters

	togglePause = () => this.#progress.toggle();
	reset = () => this.#progress.reset();

	//#region Elements
	bindParentWidth = (node: HTMLElement) => {
		const bindParentWidth = new ResizeObserver((entries) => {
			this.#parentWidth = entries[0]!.contentRect.width;
		});
		bindParentWidth.observe(node);
		return {
			destroy() {
				try {
					bindParentWidth.disconnect();
				} catch (_) {
					// HMR bug with ResizeObserver
				}
			},
		};
	};
	get elSliderRoot() {
		return {
			ontouchstart: this.#swipeOnTouchstartHandleMove,
			style: `transform: translate3d(var(--transformXPerc, ${this.#movingTransformXPerc !== null ? this.#movingTransformXPerc : this.#transformXPerc}%), 0px, 0px);`,
		};
	}
	get elSliderItem() {
		return { style: `max-width: ${this.#itemWidthPerc}%; margin-right: ${this.#gapPerc}%;` };
	}
	elAccordionTrigger(i: number, onActiveClick: 'toggle' | 'nothing' = 'toggle') {
		return {
			role: 'button',
			tabindex: 0,
			'aria-label': 'Tab',
			'aria-expanded': this.#index.active === i,
			'data-control-id': i,
			onclick: (e: MouseEvent & { currentTarget: HTMLElement }) => {
				if (Number(e.currentTarget.dataset['controlId']) === this.#index.active) {
					if (onActiveClick === 'toggle') this.#progress.toggle();
				} else {
					this.#progress.goToInitial();
					this.#index.set(i);
				}
			},
			onkeydown: (e: KeyboardEvent & { currentTarget: HTMLElement }) => {
				if (['ArrowLeft', 'ArrowUp'].includes(e.code)) {
					e.preventDefault();
					this.#progress.goToInitial();
					this.#index.dec();
					const accordionTrigger = document.querySelector(`[data-control-id="${this.#index.active}"]`);
					if (accordionTrigger instanceof HTMLElement) accordionTrigger.focus();
				}
				if (['ArrowRight', 'ArrowDown'].includes(e.code)) {
					e.preventDefault();
					this.#progress.goToInitial();
					this.#index.inc();
					const accordionTrigger = document.querySelector(`[data-control-id="${this.#index.active}"]`);
					if (accordionTrigger instanceof HTMLElement) accordionTrigger.focus();
				}
				if (['Enter', 'Space'].includes(e.code)) {
					const active = Number(e.currentTarget.dataset['controlId']) === this.#index.active;
					e.preventDefault();
					if (active) {
						this.#progress.toggle();
					} else {
						this.#index.set(Number(e.currentTarget.dataset['controlId']));
						this.#progress.goToInitial();
					}
				}
			},
		};
	}
	//#endregion Elements
}
