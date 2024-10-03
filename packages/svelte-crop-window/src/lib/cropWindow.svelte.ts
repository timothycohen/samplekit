import { untrack } from 'svelte';
import { createMouseDraggableHandler, type MouseDragMove } from './actions/mouseEvents.js';
import { createTouchScalePanRotateHandler } from './actions/touchScalePanRotate.js';
import { styleToString } from './utils/css.js';
import { defaultCropWindowOptions, defaultCropValue } from './utils/defaults.js';
import { checkIfChangesNecessary } from './utils/geometry.js';
import { generateId } from './utils/id.js';
import { Points } from './utils/point.js';
import type { Size, CropValue, CropWindowOptions, Point, TouchScalePanRotate } from './utils/types.js';

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
	#r_cropValue = $state() as CropValue;
	#r_cropWindowOptions = $state() as CropWindowOptions;
	#ids: { root: string; media: string };
	#r_rootRect: null | { x: number; y: number; height: number; width: number } = $state(null);

	constructor(props?: { cropWindowOptions?: Partial<CropWindowOptions>; cropValue?: CropValue }) {
		this.#r_cropValue = props?.cropValue ?? defaultCropValue;
		this.#r_cropWindowOptions = { ...defaultCropWindowOptions, ...props?.cropWindowOptions };
		this.#ids = ['root', 'media'].reduce(
			(acc, key) => ({ ...acc, [key]: generateId() }),
			{} as { root: string; media: string },
		);
		$effect(() => {
			untrack(() => {
				this.#r_rootRect = document.getElementById(this.#ids.root)?.getBoundingClientRect() ?? null;
			});
		});
	}

	// initialized by media element (onload, onloadedmetadata)
	#r_mediaAspect: null | number = $state(null);
	#initMediaAspect() {
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

		this.#r_mediaAspect = width / height;
	}

	// derived
	#r_rootCenter: null | Point = $derived.by(() => {
		if (!this.#r_rootRect) return null;
		return { x: this.#r_rootRect.width / 2, y: this.#r_rootRect.height / 2 };
	});

	#r_cropWindowSize: null | Size = $derived.by(() => {
		if (this.#r_rootRect === null) return null;
		const wide = this.#r_rootRect.width / this.#r_rootRect.height > this.#r_cropValue.aspect;
		const marginScale = 1 - this.#r_cropWindowOptions.marginPercent / 100;
		return wide
			? {
					height: this.#r_rootRect.height * marginScale,
					width: this.#r_rootRect.height * marginScale * this.#r_cropValue.aspect,
				}
			: {
					height: (this.#r_rootRect.width * marginScale) / this.#r_cropValue.aspect,
					width: this.#r_rootRect.width * marginScale,
				};
	});

	/** If `#r_cropValue` creates dead space within the crop window, it is deemed invalid and the fixes are stored here. */
	#r_pendingFixes = $derived.by(() => {
		if (
			this.#r_rootRect === null ||
			this.#r_rootCenter === null ||
			this.#r_cropWindowSize === null ||
			this.#r_mediaAspect === null
		)
			return null;

		const { needsChange, position, scale } = checkIfChangesNecessary({
			centerPoint: this.#r_rootCenter,
			cropValue: this.#r_cropValue,
			cropWindowSize: this.#r_cropWindowSize,
			mediaAspect: this.#r_mediaAspect,
			rootElSize: { width: this.#r_rootRect.width, height: this.#r_rootRect.height },
		});

		if (!needsChange) return null;
		return { ...this.#r_cropValue, position, scale };
	});
	//#endregion Initialization

	//#region Logic
	/** Exposes methods to mutate `this.#r_cropValue`. */
	#cropController = {
		/** When the rotation changes, the pan must also change in order to keep the image centered */
		calcPanOffsetFromRotation: (angleOffset: number): Point | null => {
			const cropValue = this.#r_cropValue;
			const cropWindowHeight = this.#r_cropWindowSize?.height;
			const rootElCenter = this.#r_rootCenter;
			if (!cropWindowHeight || !rootElCenter) return null;
			if (cropValue.position.x === 0 && cropValue.position.y === 0) return null;

			const imgWidth = cropWindowHeight * cropValue.aspect * cropValue.scale;
			const imgHeight = cropWindowHeight * cropValue.scale;

			const projectionTopLeft = Points.add(
				Points.rotate({ x: -imgWidth / 2, y: -imgHeight / 2 }, angleOffset),
				Points.mul(cropValue.position, cropWindowHeight),
				rootElCenter,
			);

			const projectionBottomRight = Points.add(
				Points.rotate({ x: imgWidth / 2, y: imgHeight / 2 }, angleOffset),
				Points.mul(cropValue.position, cropWindowHeight),
				rootElCenter,
			);

			const projectionCenter = Points.getCenter(projectionTopLeft, projectionBottomRight);
			const rotated = Points.rotateAroundCenter(rootElCenter, projectionCenter, angleOffset);
			return Points.mul(Points.sub(rootElCenter, rotated), 1.0 / cropWindowHeight);
		},
		/** When the scale changes, the pan must also change in order to keep the image centered */
		calcPanOffsetFromScale: ({
			zoomOffset,
			actionCenter,
		}: {
			zoomOffset: number;
			actionCenter: Point;
		}): Point | null => {
			const { scale: currentScale, position: currentPosition } = this.#r_cropValue;
			const cropWindowHeight = this.#r_cropWindowSize?.height;
			const rootElCenter = this.#r_rootCenter;
			const rootElTopLeftPoint = this.#r_rootRect ? { x: this.#r_rootRect.x, y: this.#r_rootRect.y } : null;
			if (!cropWindowHeight || !rootElCenter || !rootElTopLeftPoint) return null;

			const scaledPosition = Points.mul(currentPosition, cropWindowHeight);
			const scaledPositionFromCenter = Points.add(rootElCenter, scaledPosition);
			const actionCenterRelativeToEl = Points.sub(actionCenter, rootElTopLeftPoint);
			const zoomOffsetFromCenter = Points.sub(actionCenterRelativeToEl, scaledPositionFromCenter);
			const newScale = currentScale * zoomOffset;
			const zoomScaleChangeFactor = (1 - newScale / currentScale) / cropWindowHeight;
			return Points.mul(zoomOffsetFromCenter, zoomScaleChangeFactor);
		},
		pan: (panOffset: Point) => {
			this.#r_cropValue.position = Points.add(this.#r_cropValue.position, panOffset);
		},
		rotate: (angleOffset: number) => {
			this.#r_cropValue.rotation += angleOffset;
		},
		zoom: (zoomOffset: number) => {
			this.#r_cropValue.scale *= zoomOffset;
		},
		zoomAndPan: ({ zoomOffset, actionCenter }: { zoomOffset: number; actionCenter: Point }) => {
			this.#cropController.zoom(zoomOffset);
			const panOffset = this.#cropController.calcPanOffsetFromScale({ zoomOffset, actionCenter });
			if (panOffset) this.#cropController.pan(panOffset);
		},
		rotateAndPan: ({ angleOffset }: { angleOffset: number }) => {
			this.#cropController.rotate(angleOffset);
			const panOffset = this.#cropController.calcPanOffsetFromRotation(angleOffset);
			if (panOffset) this.#cropController.pan(panOffset);
		},
	};

	/** gh (gesture handler) receives mouse and touch gestures and calls the appropriate cropController methods. */
	#gh = (() => {
		let mouseDragLastPoint: Point | undefined = undefined;
		let touchFocalPoint: Point | undefined = undefined;

		const mouseMoveHandler = ({ dx, dy }: { dx: number; dy: number }) => {
			const cropWindowHeight = this.#r_cropWindowSize?.height;
			if (!cropWindowHeight) return;

			const mousePan = { x: dx || 0, y: dy || 0 };
			this.#cropController.pan(Points.mul(mousePan, 1.0 / cropWindowHeight));
		};

		const mouseRotateHandler = (focalPoint: Point) => {
			const rootElTopLeftPoint = this.#r_rootRect ? { x: this.#r_rootRect.x, y: this.#r_rootRect.y } : null;
			const rootElCenter = this.#r_rootCenter;
			if (!rootElTopLeftPoint || !rootElCenter) return;

			const currentPosition = this.#r_cropValue.position;

			const imgCenter: Point = {
				x: rootElCenter.x + rootElCenter.x * currentPosition.x,
				y: rootElCenter.y + rootElCenter.y * currentPosition.y,
			};

			const mouseDragCurrentPoint = Points.sub(focalPoint, rootElTopLeftPoint);
			if (mouseDragLastPoint === undefined) {
				mouseDragLastPoint = mouseDragCurrentPoint;
				return;
			}
			const lastDragPoint = mouseDragLastPoint;
			mouseDragLastPoint = mouseDragCurrentPoint;
			const angleOffset = Points.getAngle(mouseDragCurrentPoint, imgCenter) - Points.getAngle(lastDragPoint, imgCenter);
			this.#cropController.rotateAndPan({ angleOffset });
		};

		const mouseDragmoveHandler = (detail: MouseDragMove) => {
			if (detail.mouseButton == 0) {
				mouseMoveHandler({ dx: detail.dx, dy: detail.dy });
			} else {
				mouseRotateHandler({ x: detail.x, y: detail.y });
			}
		};

		const mouseDragendHandler = () => {
			mouseDragLastPoint = undefined;
		};

		const mouseWheelHandler = (e: WheelEvent) => {
			const wheelScaleStep = 0.1;
			const mouseWheelDirection: 1 | -1 = e.deltaY <= 0 ? 1 : -1;
			const zoomOffset = 1 + mouseWheelDirection * wheelScaleStep;
			this.#cropController.zoomAndPan({ zoomOffset, actionCenter: { x: e.x, y: e.y } });
		};

		const touchHandler = (detail: TouchScalePanRotate) => {
			const cropWindowHeight = this.#r_cropWindowSize?.height;
			if (!cropWindowHeight) return;

			if (!touchFocalPoint) {
				touchFocalPoint = detail.focalPoint;
			}

			this.#cropController.zoomAndPan({ zoomOffset: detail.scale, actionCenter: detail.focalPoint });
			this.#cropController.rotateAndPan({ angleOffset: detail.rotation });
			this.#cropController.pan(Points.mul(detail.pan, 1.0 / cropWindowHeight));
		};

		const touchendHandler = () => {
			touchFocalPoint = undefined;
		};

		return {
			mouseDragmoveHandler,
			mouseDragendHandler,
			mouseWheelHandler,
			touchHandler,
			touchendHandler,
		};
	})();

	/** Debounces assigning #r_pendingFixes to #r_cropValue to create an "autoFix" feature. */
	#stateController = (() => {
		let r_state: 'idle' | 'active' | 'debounce' | 'fixing' = $state('idle');
		let untilFix: null | ReturnType<typeof setTimeout> = null;
		let untilFixOver: null | ReturnType<typeof setTimeout> = null;

		const start = () => {
			if (untilFix) clearTimeout(untilFix);
			if (untilFixOver) clearTimeout(untilFixOver);
			r_state = 'active';
		};

		const finish = () => {
			if (untilFix) clearTimeout(untilFix);
			if (untilFixOver) clearTimeout(untilFixOver);
			r_state = 'debounce';
			untilFix = setTimeout(() => {
				if (!this.#r_pendingFixes) {
					r_state = 'idle';
					return;
				}

				r_state = 'fixing';
				this.#r_cropValue = this.#r_pendingFixes;
				untilFixOver = setTimeout(() => {
					r_state = 'idle';
				}, this.#r_cropWindowOptions.fixDurationMs);
			}, this.#r_cropWindowOptions.fixDelayMs);
		};

		return {
			start,
			finish,
			get r_state() {
				return r_state;
			},
		};
	})();

	/** Returns DOM event listeners that call the gesture handler and state controller. */
	#gestureHandlers = (() => {
		const klass = this;

		return {
			...createMouseDraggableHandler({
				onMouseDraggableMove: (e) => {
					klass.#gh.mouseDragmoveHandler(e);
					klass.#stateController.start();
				},
				onMouseDraggableEnd: () => {
					klass.#gh.mouseDragendHandler();
					klass.#stateController.finish();
				},
			}),
			...createTouchScalePanRotateHandler({
				onTouchScalePanRotate: (e) => {
					klass.#gh.touchHandler(e);
					klass.#stateController.start();
				},
				onTouchendScalePanRotate: () => {
					klass.#gh.touchendHandler();
					klass.#stateController.finish();
				},
			}),
			onwheel(e: WheelEvent) {
				e.preventDefault();
				klass.#gh.mouseWheelHandler(e);
				klass.#stateController.finish();
			},
		};
	})();
	//#endregion Logic

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
					height: '100%',
					width: '100%',
					overflow: 'hidden',
					position: 'relative',
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
				if (!klass.#r_rootCenter || !klass.#r_cropWindowSize) return 'display: none;';

				const mediaPosition = Points.add(
					klass.#r_rootCenter,
					Points.mul(klass.#r_cropValue.position, klass.#r_cropWindowSize.height),
				);

				return styleToString({
					transform: `translateX(-50%) translateY(-50%) rotate(${klass.#r_cropValue.rotation}deg)`,
					height: `${klass.#r_cropWindowSize.height * klass.#r_cropValue.scale}px`,
					'margin-left': `${mediaPosition.x}px`,
					'margin-top': `${mediaPosition.y}px`,
					'max-width': 'none',
					'user-select': 'none',
					'pointer-events': 'none',
					transition:
						klass.#stateController.r_state === 'fixing' ? `all ${klass.#r_cropWindowOptions.fixDurationMs}ms` : 'none',
				});
			},
			onload() {
				klass.#initMediaAspect();
			},
			onloadedmetadata() {
				klass.#initMediaAspect();
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
					position: 'absolute',
					overflow: 'hidden',
					height: `${klass.#r_cropWindowSize.height}px`,
					width: `${klass.#r_cropWindowSize.width}px`,
					left: `${klass.#r_rootCenter.x - klass.#r_cropWindowSize.width / 2}px`,
					top: `${klass.#r_rootCenter.y - klass.#r_cropWindowSize.height / 2}px`,
					'border-radius': klass.#r_cropValue.shape === 'round' ? '50%' : '0',
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
						position: 'absolute',
						height,
						width,
						top,
						left,
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
			...this.#gestureHandlers,
		};
	}
	//#endregion Elements

	//#region Getters and Setters
	// gesture controller updates the cropValue and calls the start/finish methods directly
	// this is for public access only and is proxied so that setting the cropValue programmatically also calls the auto-fixing mechanism.
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
	scaleAndKeepFocus(scale: number) {
		const actionCenter = this.#r_rootCenter;
		if (!actionCenter) return;
		this.#cropController.zoomAndPan({ zoomOffset: scale / this.#r_cropValue.scale, actionCenter });
		this.#stateController.finish();
	}
	rotateAndKeepFocus(angle: number) {
		this.#cropController.rotateAndPan({ angleOffset: angle - this.#r_cropValue.rotation });
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
