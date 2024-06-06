export type Point = {
	x: number;
	y: number;
};

export type CropShape = 'rect' | 'round';

export type CropValue = {
	shape: CropShape;
	position: Point;
	aspect: number;
	rotation: number;
	scale: number;
};
