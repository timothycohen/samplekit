import type { CropValue, CropWindowOptions } from './types.js';

export const defaultCropWindowOptions: CropWindowOptions = {
	marginPercent: 0,
	fixDelayMs: 500,
	fixDurationMs: 500,
};

export const defaultCropValue: CropValue = {
	shape: 'round',
	position: { x: 0, y: 0 },
	aspect: 1.0,
	rotation: 0,
	scale: 1,
};
