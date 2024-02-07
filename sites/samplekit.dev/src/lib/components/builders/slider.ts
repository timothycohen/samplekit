import { derived, get, writable } from 'svelte/store';
import { createIndexStore, createPausableTweened } from '$lib/stores';
import type { ActionReturn } from 'svelte/action';

// unlike melt-ui, the elements / attrs are not stores
// afaik melt-ui updates the attrs stores and that updates the DOM
// this simply spreads the attrs as initial state and then the actions modify the DOM directly

//#region Props & Types
type Props = {
	fixedLength: number | undefined;
	defaultActiveIndex: number;
	onActiveIndexChange: ((value: number) => void) | undefined;
	duration: number;
	playOnStart: boolean;
	unpauseOnChange: boolean;
	initialParentWidth: number;
	marginPerc: number;
	gapPerc: number;
};

export const createSliderPropsDefaults: Props = {
	fixedLength: undefined,
	defaultActiveIndex: 0,
	onActiveIndexChange: undefined,
	duration: 7000,
	playOnStart: true,
	unpauseOnChange: false,
	initialParentWidth: 768,
	marginPerc: 10,
	gapPerc: 5,
};

export type CreateSliderProps = Partial<Props>;

export type SliderBuilder = ReturnType<typeof createSlider>;
//#endregion Props & Types

export const createSlider = (opts: CreateSliderProps = {}) => {
	const {
		fixedLength,
		playOnStart,
		defaultActiveIndex,
		duration,
		unpauseOnChange,
		onActiveIndexChange,
		initialParentWidth,
		gapPerc,
		marginPerc,
	} = { ...createSliderPropsDefaults, ...opts };
	const itemWidthPerc = 100 - 2 * (marginPerc + gapPerc);

	//#region helpers
	const calcTransformXPerc = ({ activeIndex }: { activeIndex: number }) => {
		return marginPerc + gapPerc - activeIndex * (itemWidthPerc + gapPerc);
	};
	const calcHalfway = ({ activeIndex }: { activeIndex: number }) => {
		return {
			prev: calcTransformXPerc({ activeIndex }) - 0.5 * itemWidthPerc,
			next: calcTransformXPerc({ activeIndex }) + 0.5 * itemWidthPerc,
		};
	};
	let rootEl: HTMLElement | null = null;
	const focus = (i: number) => {
		const el = rootEl?.querySelector(`[data-control-id="${i}"]`) as undefined | HTMLElement | null;
		el?.focus();
	};
	//#endregion helpers

	//#region states
	const itemsLength = writable(fixedLength ?? 0);
	const activeIndex = createIndexStore({ itemsLength, index: writable(defaultActiveIndex) });
	const playPercentage = createPausableTweened(0, 100, { duration });
	const parentWidth = writable(initialParentWidth);
	const transformXPerc = writable(calcTransformXPerc({ activeIndex: defaultActiveIndex }));
	const isSelected = derived(activeIndex, ($activeIndex) => (i: number) => $activeIndex === i);
	//#endregion states

	//#region event handlers that capture only states and helpers
	const playPauseOnClickTogglePercentage = (e: MouseEvent): void => {
		e.stopPropagation();
		playPercentage.toggle();
	};

	const triggerOnKeydownHandleArrowKeys = (e: KeyboardEvent): void => {
		if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
			e.preventDefault();
			focus(activeIndex.dec());
		}
		if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
			focus(activeIndex.inc());
		}
	};

	const swipeOnTouchstartHandleMove = (e: TouchEvent): void => {
		const touch = e.touches[0];
		if (!touch) return;

		const { clientX: startX } = touch;
		let wasPaused: boolean | null = null;

		const move = (e: TouchEvent) => {
			if (wasPaused === null) wasPaused = get(playPercentage.isPaused);
			playPercentage.pause();

			const touch = e.touches[0];
			if (!touch) return;

			const { clientX: moveX } = touch;
			const diffPerc = ((moveX - startX) / get(parentWidth)) * 100;
			const $activeIndex = get(activeIndex);
			const { prev, next } = calcHalfway({ activeIndex: $activeIndex });
			transformXPerc.set(Math.max(Math.min(calcTransformXPerc({ activeIndex: $activeIndex }) + diffPerc, next), prev));
		};

		const end = (e: TouchEvent) => {
			if (wasPaused !== true) playPercentage.play();
			wasPaused = null;

			const touch = e.changedTouches[0];
			if (!touch) return;

			const { clientX: endX } = touch;
			const diffPerc = ((endX - startX) / get(parentWidth)) * 100;
			const thresholdPerc = 0.25 * itemWidthPerc;

			if (diffPerc < -thresholdPerc) {
				activeIndex.inc();
			} else if (diffPerc > thresholdPerc) {
				activeIndex.dec();
			} else {
				const $activeIndex = get(activeIndex);
				transformXPerc.set(calcTransformXPerc({ activeIndex: $activeIndex }));
			}
			window.removeEventListener('touchmove', move);
			window.removeEventListener('touchend', end);
		};

		window.addEventListener('touchmove', move);
		window.addEventListener('touchend', end);
	};
	//#endregion event handlers that capture only states and helpers

	return {
		states: {
			activeIndex,
			playPercentage,
			parentWidth: { subscribe: parentWidth.subscribe },
			transformXPerc: { subscribe: transformXPerc.subscribe },
		},
		helpers: { isSelected, len: () => get(itemsLength) },
		elements: {
			/**
			 * ### Logic:
			 * - bind:parentWidth
			 * - set the rootEl used for focus
			 * - add the onValueChange callback
			 */
			root: {
				attrs: {},
				action: (node: HTMLElement): ActionReturn => {
					const bindParentWidth = new ResizeObserver((entries) => {
						for (const entry of entries) {
							parentWidth.set(entry.contentRect.width);
						}
					});

					rootEl = node;
					bindParentWidth.observe(node);

					const destroyers = [bindParentWidth.disconnect];

					if (onActiveIndexChange) {
						destroyers.push(activeIndex.subscribe(onActiveIndexChange));
					}

					return {
						destroy() {
							try {
								destroyers.forEach((d) => d());
							} catch (_) {
								// HMR bug with ResizeObserver
							}
							rootEl = null;
						},
					};
				},
			},
			/**
			 * ### Logic:
			 * - When the playPercentage is finished, increment the activeIndex
			 * - When the activeIndex changes, restart the playPercentage according to the unpauseOnChange opt and recalculate the transformXPerc
			 * - When the parentWidth changes, recalculate the transformXPerc
			 * - Automatically play the playPercentage according to the playOnStart opt
			 */
			accordionRoot: {
				attrs: {},
				action: (_: HTMLElement): ActionReturn => {
					const unsubLoop = playPercentage.isFinished.subscribe((finished) => finished && activeIndex.inc());
					const unsubActiveIndex = activeIndex.subscribe((i) => {
						if (unpauseOnChange || !get(playPercentage.isPaused)) playPercentage.restart();
						else playPercentage.reset();
						transformXPerc.set(calcTransformXPerc({ activeIndex: i }));
					});
					const unsubParentWidth = parentWidth.subscribe((_) => {
						transformXPerc.set(calcTransformXPerc({ activeIndex: get(activeIndex) }));
					});

					if (playOnStart) playPercentage.play();

					return {
						destroy() {
							unsubLoop();
							playPercentage.destroy();
							unsubActiveIndex();
							unsubParentWidth();
						},
					};
				},
			},
			/**
			 * ### Attributes:
			 * - role
			 * - tabindex
			 *
			 * ### Logic:
			 * - Toggle the playPercentage play/pause state on click
			 */
			playPauseBtn: {
				attrs: { role: 'button', tabindex: 0 },
				action: (node: HTMLButtonElement): ActionReturn => {
					node.addEventListener('click', playPauseOnClickTogglePercentage);
					return {
						destroy() {
							node.removeEventListener('click', playPauseOnClickTogglePercentage);
						},
					};
				},
			},
			/**
			 * ### Attributes:
			 * - role
			 * - tabindex
			 * - aria-label
			 * - aria-expanded
			 *
			 * ### Data Attributes:
			 * - data-control-id
			 *
			 * ### Logic:
			 * - Increment the itemsLength if fixedLength opt is not set
			 * - 'keydown': increment/decrement the activeIndex with arrow keys
			 * - 'click': set the activeIndex
			 */
			accordionTrigger: (i: number) => {
				return {
					attrs: {
						role: 'button',
						tabindex: 0,
						'aria-label': 'Tab',
						'aria-expanded': get(activeIndex) === i,
						'data-control-id': i,
					},
					action: (node: HTMLElement): ActionReturn => {
						if (typeof fixedLength !== 'number') itemsLength.update((count) => count + 1);
						const triggerOnClickSetActive = () => activeIndex.set(i);

						const unsubActiveIndex = activeIndex.subscribe((index) =>
							node.setAttribute('aria-expanded', (i === index).toString()),
						);

						node.addEventListener('keydown', triggerOnKeydownHandleArrowKeys);
						node.addEventListener('click', triggerOnClickSetActive);
						return {
							destroy() {
								node.removeEventListener('keydown', triggerOnKeydownHandleArrowKeys);
								node.removeEventListener('click', triggerOnClickSetActive);
								unsubActiveIndex();
							},
						};
					},
				};
			},
			/**
			 * ### Logic:
			 * - 'touchstart':
			 *   - Move the transformXPerc on touchmove.
			 *   - Pause the playPercentage on touchmove.
			 *   - Increment/decrement the activeIndex on touchend if above 25% the parentWidth (otherwise snap back to the current activeIndex)
			 *
			 * ### Styles:
			 * - transform: translate3d(${transformXPerc}px, 0px, 0px);
			 */
			swiperRoot: {
				attrs: {
					style: `transform: translate3d(var(--transformXPerc, ${get(transformXPerc)}%), 0px, 0px);`,
				},
				action: (node: HTMLElement): ActionReturn => {
					const unsubtransformXPerc = transformXPerc.subscribe((x) => {
						node.style.setProperty('--transformXPerc', `${x}%`);
					});
					node.addEventListener('touchstart', swipeOnTouchstartHandleMove);
					return {
						destroy() {
							node.removeEventListener('touchstart', swipeOnTouchstartHandleMove);
							unsubtransformXPerc();
						},
					};
				},
			},
			/**
			 * ### Styles:
			 * - max-width: ${itemWidthPerc}%;
			 * - margin-right: ${gapPerc}%;
			 */
			swiperItem: {
				attrs: {
					style: `max-width: ${itemWidthPerc}%; margin-right: ${gapPerc}%;`,
				},
				action: (_: HTMLElement): ActionReturn => {
					return {};
				},
			},
			/**
			 * ### Attributes:
			 * - value
			 * - max
			 *
			 * ### Logic:
			 * - Set the value to the playPercentage if the activeIndex is the same as the index, otherwise set it to 0
			 */
			progress: (i: number) => ({
				attrs: { value: 0, max: 100 },
				action: (node: HTMLProgressElement): ActionReturn => {
					let unsubplayPercentage: (() => void) | null = null;

					const unsubActiveIndex = activeIndex.subscribe((index) => {
						if (i === index) {
							unsubplayPercentage = playPercentage.value.subscribe((p) => {
								node.value = p;
							});
						} else {
							node.value = 0;
							unsubplayPercentage?.();
							unsubplayPercentage = null;
						}
					});

					return {
						destroy() {
							unsubActiveIndex();
							unsubplayPercentage?.();
						},
					};
				},
			}),
		},
	};
};
