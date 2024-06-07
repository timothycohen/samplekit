export type Point = {
	x: number;
	y: number;
};

export type Size = {
	width: number;
	height: number;
};

export type CropShape = 'rect' | 'round';

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
