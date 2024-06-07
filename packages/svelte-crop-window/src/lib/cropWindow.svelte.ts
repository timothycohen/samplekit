import { untrack } from 'svelte';
import { createMouseDraggableHandler } from './actions/mouseEvents.js';
import { createTouchScalePanRotateHandler } from './actions/touchScalePanRotate.js';
import { GestureHandler } from './gestureHandler.svelte.js';
import { styleToString } from './utils/css.js';
import { defaultCropWindowOptions, defaultCropValue } from './utils/defaults.js';
import { checkIfChangesNecessary } from './utils/geometry.js';
import { generateId } from './utils/id.js';
import { Points } from './utils/point.js';
import type { Size, CropValue, CropWindowOptions, Point } from './utils/types.js';

export class CropWindow {
	//#region Initialization
	// initialized in constructor()
	#r_cropValue: CropValue = $state() as CropValue;
	#r_cropWindowOptions = $state() as CropWindowOptions;
	#ids: { root: string; media: string };
	#r_rootElRect: null | { x: number; y: number; height: number; width: number } = $state(null);
	#initRoot() {
		this.#r_rootElRect = document.getElementById(this.#ids.root)?.getBoundingClientRect() ?? null;
	}

	constructor(props?: { cropWindowOptions?: Partial<CropWindowOptions>; cropValue?: CropValue }) {
		this.#r_cropValue = props?.cropValue ?? defaultCropValue;
		this.#r_cropWindowOptions = { ...defaultCropWindowOptions, ...props?.cropWindowOptions };
		this.#ids = ['root', 'media'].reduce(
			(acc, key) => ({ ...acc, [key]: generateId() }),
			{} as { root: string; media: string },
		);

		$effect(() => {
			untrack(() => {
				this.#initRoot();
			});
		});
	}

	// initialized in media.onload()
	#r_naturalMediaSize: null | { width: number; height: number; aspect: number } = $state(null);
	#initNaturalMediaSize() {
		const mediaEl = document.getElementById(this.#ids.media);
		if (!mediaEl) return;

		let width: number | null = null;
		let height: number | null = null;
		if (mediaEl instanceof HTMLImageElement) {
			width = mediaEl.naturalWidth;
			height = mediaEl.naturalHeight;
		}
		if (mediaEl instanceof HTMLVideoElement) {
			width = mediaEl.videoWidth;
			height = mediaEl.videoHeight;
		}
		if (width === null || height === null) return;
		if (height === 0) throw new Error('Media height is 0');

		this.#r_naturalMediaSize = { width, height, aspect: width / height };
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

	#r_outerElTopLeftPoint: null | Point = $derived(
		this.#r_rootElRect ? { x: this.#r_rootElRect.x, y: this.#r_rootElRect.y } : null,
	);

	#r_gestureHandler: null | GestureHandler = $derived.by(() => {
		if (!this.#r_cropWindowSize || !this.#r_rootElRect || !this.#r_rootCenter || !this.#r_outerElTopLeftPoint)
			return null;

		const cropController = {
			pan: (positionOffset: Point) => {
				this.#r_cropValue.position = Points.add(this.#r_cropValue.position, positionOffset);
				this.autoFixIn500ms();
			},
			rotate: (angleOffset: number) => {
				this.#r_cropValue.rotation += angleOffset;
				this.autoFixIn500ms();
			},
			zoom: (zoomOffset: number) => {
				this.#r_cropValue.scale *= zoomOffset;
				this.autoFixIn500ms();
			},
		};

		return new GestureHandler({
			centerPoint: this.#r_rootCenter,
			cropWindowSize: this.#r_cropWindowSize,
			outerElTopLeftPoint: this.#r_outerElTopLeftPoint,
			currentPosition: this.#r_cropValue.position,
			cropController,
		});
	});

	#r_pendingFixes = $derived.by(() => {
		if (
			this.#r_rootCenter === null ||
			this.#r_cropWindowSize === null ||
			this.#r_naturalMediaSize === null ||
			this.#r_rootElRect === null
		)
			return null;

		const { needsChange, position, scale } = checkIfChangesNecessary({
			centerPoint: this.#r_rootCenter,
			cropValue: this.#r_cropValue,
			cropWindowSize: this.#r_cropWindowSize,
			mediaAspect: this.#r_naturalMediaSize.aspect,
			rootElSize: { width: this.#r_rootElRect.width, height: this.#r_rootElRect.height },
		});

		if (!needsChange) return null;
		return { ...this.#r_cropValue, position, scale };
	});
	//#endregion Initialization

	//#region Helpers
	#r_autoFixTransition = $state(false);
	#autoFixTransition500msTimeout: null | ReturnType<typeof setTimeout> = null;
	#autoFixIn500msTimeout: null | ReturnType<typeof setTimeout> = null;
	applyFixes() {
		if (!this.#r_pendingFixes) return;
		if (this.#autoFixIn500msTimeout) clearTimeout(this.#autoFixIn500msTimeout);
		if (this.#autoFixTransition500msTimeout) clearTimeout(this.#autoFixTransition500msTimeout);
		this.#r_autoFixTransition = true;
		this.#r_cropValue = this.#r_pendingFixes;
		this.#autoFixTransition500msTimeout = setTimeout(() => (this.#r_autoFixTransition = false), 500);
	}
	autoFixIn500ms() {
		if (this.#autoFixIn500msTimeout) clearTimeout(this.#autoFixIn500msTimeout);
		this.#autoFixIn500msTimeout = setTimeout(() => this.applyFixes(), 500);
	}
	//#endregion Helpers

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
			get id() {
				return klass.#ids.media;
			},
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
					transition: klass.#r_autoFixTransition ? 'all 0.5s' : 'none',
				});
			},
			onload() {
				klass.#initNaturalMediaSize();
			},
			onloadedmetadata() {
				klass.#initNaturalMediaSize();
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

	gestureHandler({ disabled }: { disabled?: boolean } = {}) {
		const klass = this;

		const handlers = (() => {
			const gh = klass.#r_gestureHandler;
			if (gh === null) return {};

			return {
				...createMouseDraggableHandler({
					onMouseDraggableMove: (e) => {
						gh.mouseDragmoveHandler(e);
					},
					onMouseDraggableEnd: () => {
						gh.mouseDragendHandler();
					},
				}),
				...createTouchScalePanRotateHandler({
					onTouchScalePanRotate: (e) => {
						gh.touchHandler(e);
					},
					onTouchendScalePanRotate: () => {
						gh.touchendHandler();
					},
				}),
				onwheel(e: WheelEvent) {
					e.preventDefault();
					gh.wheelHandler(e);
				},
			};
		})();

		return {
			get style() {
				return styleToString({
					position: 'absolute',
					inset: '0',
					'background-color': 'transparent',
					cursor: disabled ? 'default' : 'crosshair',
					'pointer-events': disabled ? 'none' : 'all',
					'touch-action': 'none',
				});
			},
			...handlers,
		};
	}
	//#endregion Elements

	//#region Getters and Setters
	get cropValue() {
		return new Proxy(this.#r_cropValue, {
			get: <K extends keyof CropValue>(target: CropValue, prop: K) => {
				if (prop === 'position')
					return new Proxy(target.position, {
						set: <K extends keyof Points>(target: Points, prop: K, value: Points[K]) => {
							target[prop] = value;
							this.autoFixIn500ms();
							return true;
						},
					});
				return target[prop];
			},
			set: <K extends keyof CropValue>(target: CropValue, prop: K, value: CropValue[K]) => {
				target[prop] = value;
				this.autoFixIn500ms();
				return true;
			},
		});
	}
	set cropValue(value: CropValue) {
		this.#r_cropValue = value;
		this.autoFixIn500ms();
	}
	get cropWindowOptions() {
		return this.#r_cropWindowOptions;
	}
	get pendingFixes() {
		return this.#r_pendingFixes;
	}
	//#endregion Getters and Setters
}
