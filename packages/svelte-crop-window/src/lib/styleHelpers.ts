import { styleToString } from './utils/css.js';
import type { CropShape, CropValue } from './utils/types.js';

export function outerStyles({ shape, height }: { shape: CropShape; height: number }): string {
	return styleToString({
		position: 'relative',
		overflow: 'hidden',
		height: `${height}px`,
		width: `${height}px`,
		'border-radius': shape === 'round' ? '50%' : '0',
	});
}

export function mediaStyles({
	cropValue,
	height,
}: {
	cropValue: Pick<CropValue, 'aspect' | 'position' | 'rotation' | 'scale'>;
	height: number;
}): string {
	return styleToString({
		transform: `translateX(-50%) translateY(-50%) rotate(${cropValue.rotation || 0}deg)`,
		height: `${(cropValue.scale || 0.0) * height}px`,
		'margin-left': `${(height * cropValue.aspect) / 2 + (cropValue.position.x || 0) * height}px`,
		'margin-top': `${height / 2 + (cropValue.position.y || 0) * height}px`,
		'max-width': 'none',
		'user-select': 'none',
	});
}

export function cropValueToStyles({ cropValue, height }: { cropValue: CropValue; height: number }): {
	outer: string;
	media: string;
} {
	return {
		outer: styleToString({
			position: 'relative',
			overflow: 'hidden',
			height: `${height}px`,
			width: `${(cropValue?.aspect ?? 1) * height}px`,
			'border-radius': cropValue.shape === 'round' ? '50%' : '0',
		}),
		media: styleToString({
			transform: `translateX(-50%) translateY(-50%) rotate(${cropValue.rotation || 0}deg)`,
			height: `${(cropValue.scale || 0.0) * height}px`,
			'margin-left': `${(height * cropValue.aspect) / 2 + (cropValue.position.x || 0) * height}px`,
			'margin-top': `${height / 2 + (cropValue.position.y || 0) * height}px`,
			'max-width': 'none',
			'user-select': 'none',
		}),
	};
}
