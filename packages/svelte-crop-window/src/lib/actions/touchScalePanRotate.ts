import { Points } from '../utils/point.js';
import { preventDefault } from './handlers.js';
import type { Point, TouchScalePanRotate } from '../utils/types.js';

// these make it easier to scale and rotate independently
const MIN_ROTATION = 20;
const MIN_PAN = 35;
const MIN_SCALE = 1.15;

type TouchScalePanRotateActionOptions = {
	onTouchScalePanRotate?: (d: TouchScalePanRotate) => void;
	onTouchendScalePanRotate: () => void;
};

type TouchScalePanRotateHandler = {
	ontouchstart: (event: TouchEvent & { currentTarget: HTMLElement }) => void;
	ongesturestart: (event: Event) => boolean;
	ongesturechange: (event: Event) => boolean;
};

export function createTouchScalePanRotateHandler({
	onTouchScalePanRotate,
	onTouchendScalePanRotate,
}: TouchScalePanRotateActionOptions): TouchScalePanRotateHandler {
	let rect: DOMRect | undefined = undefined;
	let touches: { p: Point; identifier: number }[] = [];
	let rafTimeout: number | undefined = undefined;
	let rotationAccumulated = 0;
	let panAccumulated: Point = { x: 0, y: 0 };
	let scaleAccumulated = 1;

	function updateTouches(t: Touch) {
		if (!rect) throw new Error('rect is not defined');
		const p = Points.sub({ x: t.clientX, y: t.clientY }, rect);
		const existingTouch = touches.find((touch) => touch.identifier == t.identifier);
		if (existingTouch) existingTouch.p = p;
		else touches.push({ p, identifier: t.identifier });
	}

	function dispatchTouchScalePanRotate(e: TouchScalePanRotate, touches: TouchList) {
		if (rafTimeout) window.cancelAnimationFrame(rafTimeout);
		rafTimeout = window.requestAnimationFrame(() => {
			onTouchScalePanRotate?.(e);
			for (const t of touches) updateTouches(t);
		});
	}

	function handleTouchstart(event: TouchEvent & { currentTarget: HTMLElement }) {
		// https://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
		rect = event.currentTarget.getBoundingClientRect();

		for (const t of event.changedTouches) updateTouches(t);

		rotationAccumulated = 0;
		panAccumulated = { x: 0, y: 0 };
		scaleAccumulated = 1;

		window.addEventListener('touchmove', handleTouchmove);
		window.addEventListener('touchend', handleTouchend);
	}

	function handleTouchmove(event: TouchEvent) {
		if (!rect) throw new Error('rect is not defined'); // SAFETY: set in handleTouchstart
		const touch0 = event.touches[0];
		if (!touch0) throw new Error('touch0 is not defined'); // SAFETY: at least one touch is present in touchmove
		const old0 = touches.find((touch) => touch.identifier === touch0.identifier)?.p;
		if (!old0) throw new Error('old0 is not defined'); // SAFETY: old0 is set in handleTouchstart

		const touch1 = event.touches[1];
		if (touch1) {
			const old1 = touches.find((touch) => touch.identifier === touch1.identifier)?.p;
			if (!old1) throw new Error('old1 is not defined');

			const new1 = Points.sub({ x: touch0.clientX, y: touch0.clientY }, rect);
			const new2 = Points.sub({ x: touch1.clientX, y: touch1.clientY }, rect);

			const oldFocalPoint = Points.getCenter(old0, old1);
			const focalPoint = Points.getCenter(new1, new2);

			const rotationOffset = Points.getAngle(new1, new2) - Points.getAngle(old0, old1);
			const rotationIsUnlocked = rotationAccumulated < -MIN_ROTATION || rotationAccumulated > MIN_ROTATION;
			if (!rotationIsUnlocked) rotationAccumulated += rotationOffset;

			const scaleOffset = Points.getDistance(new1, new2) / Points.getDistance(old0, old1);
			const scaleIsUnlocked = scaleAccumulated > MIN_SCALE || scaleAccumulated < 1 / MIN_SCALE;
			if (!scaleIsUnlocked) scaleAccumulated *= scaleOffset;

			const panOffset = Points.sub(focalPoint, oldFocalPoint);
			const panIsUnlocked = Points.getDistance(panAccumulated, { x: 0, y: 0 }) > MIN_PAN;
			if (!panIsUnlocked) panAccumulated = Points.add(panAccumulated, panOffset);

			const e: TouchScalePanRotate = {
				focalPoint,
				pan: panIsUnlocked ? panOffset : { x: 0, y: 0 },
				rotation: rotationIsUnlocked ? rotationOffset : 0,
				scale: scaleIsUnlocked ? scaleOffset : 1,
			};

			dispatchTouchScalePanRotate(e, event.touches);
		} else {
			const focalPoint = Points.sub({ x: touch0.clientX, y: touch0.clientY }, rect);

			const e: TouchScalePanRotate = {
				focalPoint,
				pan: Points.sub(focalPoint, old0),
				rotation: 0,
				scale: 1,
			};
			dispatchTouchScalePanRotate(e, event.touches);
		}
	}

	function handleTouchend(event: TouchEvent) {
		touches = [];
		rotationAccumulated = 0;
		scaleAccumulated = 1;
		panAccumulated = { x: 0, y: 0 };
		for (const t of event.touches) {
			updateTouches(t);
		}

		onTouchendScalePanRotate?.();
		window.removeEventListener('touchmove', handleTouchmove);
		window.removeEventListener('touchend', handleTouchend);
		rect = undefined;
	}

	return {
		ontouchstart: handleTouchstart,
		ongesturestart: preventDefault,
		ongesturechange: preventDefault,
	};
}
