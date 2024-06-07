import { untrack } from 'svelte';
import { createMouseDraggableHandler } from './actions/mouseEvents.js';
import { createTouchScalePanRotateHandler } from './actions/touchScalePanRotate.js';
import { GestureHandler } from './gestureHandler.js';
import { StateController } from './stateController.svelte.js';
import { styleToString } from './utils/css.js';
import { defaultCropWindowOptions, defaultCropValue } from './utils/defaults.js';
import { checkIfChangesNecessary } from './utils/geometry.js';
import { generateId } from './utils/id.js';
import { Points } from './utils/point.js';
import type { Size, CropValue, CropWindowOptions, Point } from './utils/types.js';

/**
 * ### Inspired by [sabine/svelte-crop-window](https://sabine.github.io/svelte-crop-window/) and [melt-ui](https://melt-ui.com/).
 *
 * A component builder which allows the user to zoom, pan, and rotate.
 *
 * Outputs a value to easily recreate the cropped value with CSS.
 *
 *
 * ### Usage
 * ```svelte
 * <script lang="ts">
 *	const cw = new CropWindow({
 *		cropValue: { ...user.avatar.cropValue },
 *		cropWindowOptions: {
 *			marginPercent: 0,
 *			fixDelayMs: 500,
 *			fixDurationMs: 500,
 *		},
 *	});
 * </script>
 *
 * <div {...cw.root({ insideCropWindowColor: 'hsl(var(--accent-3))' })}>
 * 	<img {...cw.media()} src={url} />
 * 	<div {...cw.cropWindow({ outsideCropWindowColor: 'hsl(var(--accent-5) / 0.4)' })} class="border-accent-12/25 border">
 * 		{#each cw.thirdLines({ thicknessPx: 1 }) as thirdLine}
 * 			<div {...thirdLine({ color: 'hsl(var(--accent-12) / 0.25)' })}></div>
 * 		{/each}
 * 	</div>
 * 	<div {...cw.gestureHandler()}></div>
 * </div>
 * ````
 *
 * The component is fully reactive, whether changed by user gestures (mouse, touch, wheel) or programmatically (cw.cropValue.aspect = 16 / 9).
 */
export class CropWindow {
	//#region Initialization
	// initialized in constructor()
	#r_cropValue: CropValue = $state() as CropValue;
	#r_cropWindowOptions = $state() as CropWindowOptions;
	#ids: { root: string; media: string };
	#stateController: StateController;
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
		this.#stateController = new StateController({
			fixDelayMs: this.#r_cropWindowOptions.fixDelayMs,
			fixDurationMs: this.#r_cropWindowOptions.fixDurationMs,
			needsFix: () => !!this.#r_pendingFixes,
			onFixing: () => {
				if (this.#r_pendingFixes) this.#r_cropValue = this.#r_pendingFixes;
				else this.#stateController.finish();
			},
		});
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
			},
			rotate: (angleOffset: number) => {
				this.#r_cropValue.rotation += angleOffset;
			},
			zoom: (zoomOffset: number) => {
				this.#r_cropValue.scale *= zoomOffset;
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

	//#region Elements
	/**
	 * #### Required
	 *
	 * Specify an `insideCropWindowColor` directly:
	 * ```svelte
	 * <div {...s.bg({ insideCropWindowColor: 'hsl(var(--accent-3))' })}></div>
	 * ```
	 *
	 * Or use your own markup (Tailwind shown)
	 * ```svelte
	 * <div {...s.bg()} class="bg-accent-3 absolute inset-0"></div>
	 * ```
	 */
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

	/**
	 * #### Required
	 */
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
					transition:
						klass.#stateController.r_state === 'fixing' ? `all ${klass.#r_cropWindowOptions.fixDurationMs}ms` : 'none',
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

	/**
	 * #### Required
	 * Specify an `outsideCropWindowColor` directly:
	 * ```svelte
	 * <div {...s.cropWindow({ outsideCropWindowColor: 'hsl(var(--accent-5) / 0.4)' })}>
	 * ```
	 *
	 * Or use your own styles
	 * ```svelte
	 * <div style="{s.cropWindow().style} box-shadow: hsl(var(--accent-5) / 0.4) 0 0 0 9999em;">
	 * ```
	 */
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

	/**
	 * #### Optional
	 * Specify line thickness and color directly:
	 * ```svelte
	 * {#each s.thirdLines({ thicknessPx: 1 }) as thirdLine}
	 * 	<div {...thirdLine({ color: 'hsl(var(--accent-12) / 0.25)' })}></div>
	 * {/each}
	 * ```
	 *
	 * Or use your own styles
	 * ```svelte
	 * <div
	 * 	style="{s.cropWindow().style} box-shadow: hsl(var(--gray-4) / .5) 0 0 0 9999em;"
	 * 	class="border-gray-12/50 border"
	 * >
	 * 	<div
	 * 		class="absolute left-0 top-1/3 h-px w-full {s.state !== 'idle' ? 'bg-gray-12/50' : ''}
	 * 		{s.state === 'debounce' ? '' : 'transition duration-500'}"
	 * 	></div>
	 * 	<div
	 * 		class="absolute left-0 top-2/3 h-px w-full {s.state !== 'idle' ? 'bg-gray-12/50' : ''}
	 * 		{s.state === 'debounce' ? '' : 'transition duration-500'}"
	 * 	></div>
	 * 	<div
	 * 		class="absolute left-1/3 top-0 h-full w-px {s.state !== 'idle' ? 'bg-gray-12/50' : ''}
	 * 		{s.state === 'debounce' ? '' : 'transition duration-500'}"
	 * 	></div>
	 * 	<div
	 * 		class="absolute left-2/3 top-0 h-full w-px {s.state !== 'idle' ? 'bg-gray-12/50' : ''}
	 * 		{s.state === 'debounce' ? '' : 'transition duration-500'}"
	 * 	></div>
	 * </div>
	 * ```
	 */
	thirdLines({ thicknessPx }: { thicknessPx?: number } = {}) {
		const klass = this;

		const lines = [
			[`${thicknessPx ?? 1}px`, '100%', '33%', '0%'],
			[`${thicknessPx ?? 1}px`, '100%', '66%', '0%'],
			['100%', `${thicknessPx ?? 1}px`, '0%', '33%'],
			['100%', `${thicknessPx ?? 1}px`, '0%', '66%'],
		] as const;

		return lines.map(([height, width, top, left]) => ({ color }: { color?: string } = {}) => {
			const extra = (() => {
				if (!color) return {};
				const showReticle =
					klass.#stateController.r_state === 'active' || klass.#stateController.r_state === 'debounce';
				const fade = klass.#stateController.r_state !== 'debounce';
				return {
					'background-color': showReticle ? `${color}` : 'none',
					transition: fade ? `background-color ${klass.#r_cropWindowOptions.fixDurationMs}ms` : 'none',
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

	/**
	 * #### Required
	 * Handles the gestures for zoom, pan, and rotate.
	 *
	 * Optionally disable the gestures by passing `disabled: true`.
	 */
	gestureHandler({ disabled }: { disabled?: boolean } = {}) {
		const klass = this;

		const handlers = (() => {
			const gh = klass.#r_gestureHandler;
			if (gh === null) return {};

			return {
				...createMouseDraggableHandler({
					onMouseDraggableMove: (e) => {
						gh.mouseDragmoveHandler(e);
						klass.#stateController.start();
					},
					onMouseDraggableEnd: () => {
						gh.mouseDragendHandler();
						klass.#stateController.finish();
					},
				}),
				...createTouchScalePanRotateHandler({
					onTouchScalePanRotate: (e) => {
						gh.touchHandler(e);
						klass.#stateController.start();
					},
					onTouchendScalePanRotate: () => {
						gh.touchendHandler();
						klass.#stateController.finish();
					},
				}),
				onwheel(e: WheelEvent) {
					e.preventDefault();
					gh.wheelHandler(e);
					klass.#stateController.finish();
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
	// gesture controller updates the cropValue and calls the start/finish methods directly
	// this is for public access only and is proxied so that setting the cropValue programmatically also calls the auto-fixing mechanism.
	// todo: setting the rotation should also update the position.
	get cropValue() {
		return new Proxy(this.#r_cropValue, {
			get: <K extends keyof CropValue>(target: CropValue, prop: K) => {
				if (prop === 'position')
					return new Proxy(target.position, {
						set: <K extends keyof Points>(target: Points, prop: K, value: Points[K]) => {
							target[prop] = value;
							this.#stateController.finish();
							return true;
						},
					});
				return target[prop];
			},
			set: <K extends keyof CropValue>(target: CropValue, prop: K, value: CropValue[K]) => {
				target[prop] = value;
				this.#stateController.finish();
				return true;
			},
		});
	}
	set cropValue(value: CropValue) {
		this.#r_cropValue = value;
		this.#stateController.finish();
	}
	get cropWindowOptions() {
		return this.#r_cropWindowOptions;
	}
	get state() {
		return this.#stateController.r_state;
	}
	get pendingFixes() {
		return this.#r_pendingFixes;
	}
	//#endregion Getters and Setters
}
