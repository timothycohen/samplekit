import { Points } from './utils/point.js';
import type { MouseDragMove } from './actions/mouseEvents.js';
import type { Size, Point, TouchScalePanRotate } from './utils/types.js';

type CropController = {
	pan: (panOffset: Point) => void;
	zoom: (zoomOffset: number) => void;
	rotate: (angleOffset: number) => void;
};

/**
 * Handles mouse and touch gestures by interpreting the movement, calculating the geometry, and calling the cropController.
 */
export class GestureHandler {
	#centerPoint: Point;
	#cropWindowSize: Size;
	#outerElTopLeftPoint: Point;
	#currentPosition: Point;
	#cropController: CropController;

	#mouseDragLastPoint: Point | undefined = undefined;
	#touchFocalPoint: Point | undefined = undefined;

	constructor(props: {
		centerPoint: Point;
		cropWindowSize: Size;
		outerElTopLeftPoint: Point;
		currentPosition: Point;
		cropController: CropController;
	}) {
		this.#centerPoint = props.centerPoint;
		this.#cropWindowSize = props.cropWindowSize;
		this.#outerElTopLeftPoint = props.outerElTopLeftPoint;
		this.#currentPosition = props.currentPosition;
		this.#cropController = props.cropController;
	}

	#mouseMoveHandler({ dx, dy, cropWindowHeight }: { dx: number; dy: number; cropWindowHeight: number }) {
		const mousePan = { x: dx || 0, y: dy || 0 };
		this.#cropController.pan(Points.mul(mousePan, 1.0 / cropWindowHeight));
	}

	#mouseRotateHandler({ detail, imgCenter }: { detail: Point; imgCenter: Point }) {
		const mouseDragCurrentPoint = Points.sub(detail, this.#outerElTopLeftPoint);
		if (this.#mouseDragLastPoint === undefined) {
			this.#mouseDragLastPoint = mouseDragCurrentPoint;
			return;
		}
		const lastDragPoint = this.#mouseDragLastPoint;
		this.#mouseDragLastPoint = mouseDragCurrentPoint;
		const mouseRotate = Points.getAngle(mouseDragCurrentPoint, imgCenter) - Points.getAngle(lastDragPoint, imgCenter);

		// todo: this should also call this.#cropController.pan to keep the center point in the same place
		this.#cropController.rotate(mouseRotate);
	}

	mouseDragmoveHandler(detail: MouseDragMove) {
		if (detail.mouseButton == 0) {
			this.#mouseMoveHandler({ dx: detail.dx, dy: detail.dy, cropWindowHeight: this.#cropWindowSize.height });
		} else {
			this.#mouseRotateHandler({ detail: { x: detail.x, y: detail.y }, imgCenter: this.#centerPoint });
		}
	}

	mouseDragendHandler() {
		this.#mouseDragLastPoint = undefined;
	}

	wheelHandler(e: WheelEvent) {
		const wheelScaleStep = 0.1;
		const mouseWheelDirection: 1 | -1 = e.deltaY <= 0 ? 1 : -1;

		const zoomOffset = 1 + mouseWheelDirection * wheelScaleStep;

		const actionCenter = Points.sub({ x: e.x, y: e.y }, this.#outerElTopLeftPoint);
		const scaledPosition = Points.mul(this.#currentPosition, this.#cropWindowSize.height);
		const scaledPositionFromCenter = Points.add(this.#centerPoint, scaledPosition);
		const zoomOffsetFromCenter = Points.sub(actionCenter, scaledPositionFromCenter);
		const zoomScaleChangeFactor = -mouseWheelDirection * (wheelScaleStep / this.#cropWindowSize.height);
		const panOffset = Points.mul(zoomOffsetFromCenter, zoomScaleChangeFactor);

		this.#cropController.zoom(zoomOffset);
		this.#cropController.pan(panOffset);
	}

	touchHandler(detail: TouchScalePanRotate) {
		if (!this.#touchFocalPoint) {
			this.#touchFocalPoint = detail.focalPoint;
		}

		this.#cropController.zoom(detail.scale);
		this.#cropController.rotate(detail.rotation);
		this.#cropController.pan(Points.mul(detail.pan, 1.0 / this.#cropWindowSize.height));
	}

	numberOfTouchPointsChangeHandler() {
		this.#touchFocalPoint = undefined;
	}

	touchendHandler() {
		this.#touchFocalPoint = undefined;
	}
}
