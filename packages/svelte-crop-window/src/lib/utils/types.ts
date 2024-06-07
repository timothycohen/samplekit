export type Point = {
	x: number;
	y: number;
};

export type Size = {
	width: number;
	height: number;
};

export type CropShape = 'rect' | 'round';

/**
 * When scaling or rotating, `position` must be updated to keep the same center point.
 */
export type CropValue = {
	shape: CropShape;
	position: Point;
	aspect: number;
	rotation: number;
	scale: number;
};

export type TouchScalePanRotate = {
	focalPoint: Point;
	pan: Point;
	rotation: number;
	scale: number;
};

export type CropWindowOptions = {
	marginPercent: number;
	fixDelayMs: number;
	fixDurationMs: number;
};
