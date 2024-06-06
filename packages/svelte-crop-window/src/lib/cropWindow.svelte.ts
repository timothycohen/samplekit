import { untrack } from 'svelte';
import { styleToString } from './utils/css.js';
import { defaultCropWindowOptions, defaultCropValue } from './utils/defaults.js';
import { generateId } from './utils/id.js';
import { Points } from './utils/point.js';
import type { Size, CropValue, CropWindowOptions, Point } from './utils/types.js';

export class CropWindow {
	//#region Initialization
	// initialized in constructor()
	#r_cropValue: CropValue = $state() as CropValue;
	#r_cropWindowOptions = $state() as CropWindowOptions;
	#ids: { root: string };
	#r_rootElRect: null | { x: number; y: number; height: number; width: number } = $state(null);
	#initRoot() {
		this.#r_rootElRect = document.getElementById(this.#ids.root)?.getBoundingClientRect() ?? null;
	}

	constructor(props?: { cropWindowOptions?: Partial<CropWindowOptions>; cropValue?: CropValue }) {
		this.#r_cropValue = props?.cropValue ?? defaultCropValue;
		this.#r_cropWindowOptions = { ...defaultCropWindowOptions, ...props?.cropWindowOptions };
		this.#ids = ['root'].reduce((acc, key) => ({ ...acc, [key]: generateId() }), {} as { root: string });

		$effect(() => {
			untrack(() => {
				this.#initRoot();
			});
		});
	}

	// derived
	#r_cropWindowSize: null | Size = $derived.by(() => {
		if (this.#r_rootElRect === null) return null;
		const wide = this.#r_rootElRect.width / this.#r_rootElRect.height > this.#r_cropValue.aspect;
		const marginScale = 1 - this.#r_cropWindowOptions.marginPercent / 100;
		return wide
			? {
					height: this.#r_rootElRect.height * marginScale,
					width: this.#r_rootElRect.height * marginScale * this.#r_cropValue.aspect,
				}
			: {
					height: (this.#r_rootElRect.width * marginScale) / this.#r_cropValue.aspect,
					width: this.#r_rootElRect.width * marginScale,
				};
	});

	#r_rootCenter: null | Point = $derived(
		this.#r_rootElRect ? { x: this.#r_rootElRect.width / 2, y: this.#r_rootElRect.height / 2 } : null,
	);
	//#endregion Initialization

	//#region Elements
	root({ insideCropWindowColor }: { insideCropWindowColor?: string } = {}) {
		const klass = this;

		return {
			get id() {
				return klass.#ids.root;
			},
			get style() {
				return styleToString({
					...{
						height: '100%',
						width: '100%',
						overflow: 'hidden',
						position: 'relative',
					},
					...(insideCropWindowColor ? { 'background-color': insideCropWindowColor } : {}),
				});
			},
		};
	}

	media() {
		const klass = this;

		return {
			get style() {
				if (!klass.#r_cropWindowSize || !klass.#r_rootCenter) return 'display: none;';

				const position = Points.add(
					klass.#r_rootCenter,
					Points.mul(klass.#r_cropValue.position, klass.#r_cropWindowSize.height),
				);

				return styleToString({
					transform: `translateX(-50%) translateY(-50%) rotate(${klass.#r_cropValue.rotation}deg)`,
					height: `${klass.#r_cropWindowSize.height * klass.#r_cropValue.scale}px`,
					'margin-left': `${position.x}px`,
					'margin-top': `${position.y}px`,
					'max-width': 'none',
					'user-select': 'none',
					'pointer-events': 'none',
				});
			},
		};
	}

	cropWindow({ outsideCropWindowColor }: { outsideCropWindowColor?: string } = {}) {
		const klass = this;

		return {
			get style() {
				if (!klass.#r_cropWindowSize || !klass.#r_rootCenter) return styleToString({ display: 'none' });
				return styleToString({
					...{
						position: 'absolute',
						overflow: 'hidden',
						height: `${klass.#r_cropWindowSize.height}px`,
						width: `${klass.#r_cropWindowSize.width}px`,
						left: `${klass.#r_rootCenter.x - klass.#r_cropWindowSize.width / 2}px`,
						top: `${klass.#r_rootCenter.y - klass.#r_cropWindowSize.height / 2}px`,
						'border-radius': klass.#r_cropValue.shape === 'round' ? '50%' : '0',
					},
					...(outsideCropWindowColor ? { 'box-shadow': `${outsideCropWindowColor} 0 0 0 9999em` } : {}),
				});
			},
		};
	}

	thirdLines({ thicknessPx }: { thicknessPx?: number } = {}) {
		const lines = [
			[`${thicknessPx ?? 1}px`, '100%', '33%', '0%'],
			[`${thicknessPx ?? 1}px`, '100%', '66%', '0%'],
			['100%', `${thicknessPx ?? 1}px`, '0%', '33%'],
			['100%', `${thicknessPx ?? 1}px`, '0%', '66%'],
		] as const;

		return lines.map(([height, width, top, left]) => ({ color }: { color?: string } = {}) => {
			const extra = (() => {
				if (!color) return {};
				return {
					'background-color': color,
				};
			})();

			return {
				get style() {
					return styleToString({
						...{
							position: 'absolute',
							height,
							width,
							top,
							left,
						},
						...extra,
					});
				},
			};
		});
	}

	gestureHandler() {
		return {
			get style() {
				return styleToString({
					position: 'absolute',
					inset: '0',
					'background-color': 'transparent',
					cursor: 'crosshair',
				});
			},
		};
	}
	//#endregion Elements

	//#region Getters and Setters
	get cropValue() {
		return this.#r_cropValue;
	}
	set cropValue(value: CropValue) {
		this.cropValue = value;
	}
	get cropWindowOptions() {
		return this.#r_cropWindowOptions;
	}
	//#endregion Getters and Setters
}
