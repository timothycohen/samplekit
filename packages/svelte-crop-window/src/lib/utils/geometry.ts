// https://github.com/sabine/svelte-crop-window/blob/main/src/lib/crop_window/CropMediaView.svelte

import { Points } from './point.js';
import type { CropValue, Point, Size } from './types.js';

function tangentPointOnEllipse(a: number, b: number, m: number): Point {
	return {
		x: (a * a * m) / Math.sqrt(a * a * m * m + b * b),
		y: (b * b) / Math.sqrt(a * a * m * m + b * b),
	};
}

function calculateRotatedCropWindowPoints({
	cropValue,
	centerPoint,
	cropWindowSize,
	rootElSize,
}: {
	centerPoint: Point;
	cropValue: CropValue;
	cropWindowSize: Size;
	rootElSize: Size;
}) {
	if (cropValue.shape == 'rect') {
		const leftCropWindow = (rootElSize.width - cropWindowSize.width) / 2;
		const rightCropWindow = (rootElSize.width - cropWindowSize.width) / 2 + cropWindowSize.width;
		const topCropWindow = (rootElSize.height - cropWindowSize.height) / 2;
		const bottomCropWindow = (rootElSize.height - cropWindowSize.height) / 2 + cropWindowSize.height;

		return {
			ctl: Points.rotateAroundCenter({ x: leftCropWindow, y: topCropWindow }, centerPoint, -cropValue.rotation),
			ctr: Points.rotateAroundCenter({ x: rightCropWindow, y: topCropWindow }, centerPoint, -cropValue.rotation),
			cbl: Points.rotateAroundCenter({ x: leftCropWindow, y: bottomCropWindow }, centerPoint, -cropValue.rotation),
			cbr: Points.rotateAroundCenter({ x: rightCropWindow, y: bottomCropWindow }, centerPoint, -cropValue.rotation),
		};
	} else {
		// To support round crop when aspect ratio != 1, we need to find the tangent points where the slope of the tangent
		// is equal to the slope of the corresponding side of the rotated image.
		// https://www.anirdesh.com/math/algebra/ellipse-tangents.php
		//

		const slope1 = Math.tan((-cropValue.rotation / 180) * Math.PI);
		const slope2 = Math.tan(((-cropValue.rotation + 90) / 180) * Math.PI);

		const p1 = tangentPointOnEllipse(cropWindowSize.width / 2, cropWindowSize.height / 2, slope1);
		const p2 = { x: -p1.x, y: -p1.y };
		const p3 = tangentPointOnEllipse(cropWindowSize.width / 2, cropWindowSize.height / 2, slope2);
		const p4 = { x: -p3.x, y: -p3.y };

		return {
			ctl: Points.add(centerPoint, Points.rotate(p1, -cropValue.rotation)),
			ctr: Points.add(centerPoint, Points.rotate(p2, -cropValue.rotation)),
			cbr: Points.add(centerPoint, Points.rotate(p3, -cropValue.rotation)),
			cbl: Points.add(centerPoint, Points.rotate(p4, -cropValue.rotation)),
		};
	}
}

export function checkIfChangesNecessary({
	cropValue,
	centerPoint,
	cropWindowSize,
	rootElSize,
	mediaAspect,
}: {
	centerPoint: Point;
	cropValue: CropValue;
	cropWindowSize: Size;
	rootElSize: Size;
	mediaAspect: number;
}) {
	const offset = Points.mul(cropValue.position, cropWindowSize.height);

	const ip = (p: Point) => {
		const rotatedPoint = Points.rotate(p, cropValue.rotation);
		return Points.add(rotatedPoint, offset, centerPoint);
	};

	const { cbl, cbr, ctl, ctr } = calculateRotatedCropWindowPoints({
		centerPoint,
		cropValue,
		cropWindowSize,
		rootElSize,
	});

	const cropWindowMaxX = Math.max(ctl.x, ctr.x, cbl.x, cbr.x);
	const cropWindowMinX = Math.min(ctl.x, ctr.x, cbl.x, cbr.x);
	const cropWindowMaxY = Math.max(ctl.y, ctr.y, cbl.y, cbr.y);
	const cropWindowMinY = Math.min(ctl.y, ctr.y, cbl.y, cbr.y);

	if (cropValue.scale) {
		const width = cropWindowSize.height * mediaAspect * cropValue.scale;
		const height = cropWindowSize.height * cropValue.scale;

		const tlMediaPoint = ip({ x: -width / 2, y: -height / 2 });
		const mediaTLRotated = Points.rotateAroundCenter(tlMediaPoint, centerPoint, -cropValue.rotation);

		if (
			cropWindowMinX >= mediaTLRotated.x &&
			cropWindowMaxX <= mediaTLRotated.x + cropWindowSize.height * mediaAspect * cropValue.scale &&
			cropWindowMinY >= mediaTLRotated.y &&
			cropWindowMaxY <= mediaTLRotated.y + cropWindowSize.height * cropValue.scale
		) {
			return { needsChange: false, position: cropValue.position, scale: cropValue.scale };
		}
	}

	const rotatedCropWindowWidth = cropWindowMaxX - cropWindowMinX;
	const rotatedCropWindowHeight = cropWindowMaxY - cropWindowMinY;

	const requiredScale = Math.max(
		rotatedCropWindowWidth / cropWindowSize.height / mediaAspect,
		rotatedCropWindowHeight / cropWindowSize.height,
	);
	const newScale = requiredScale > cropValue.scale ? requiredScale : cropValue.scale;

	const newImageTopLeftRotated = Points.rotateAroundCenter(
		ip({ x: (-cropWindowSize.height * mediaAspect * newScale) / 2, y: (-cropWindowSize.height * newScale) / 2 }),
		centerPoint,
		-cropValue.rotation,
	);

	const scaledImageSize = {
		width: cropWindowSize.height * mediaAspect * newScale,
		height: cropWindowSize.height * newScale,
	};

	const correction = {
		x:
			Math.min(cropWindowMinX - newImageTopLeftRotated.x, 0) -
			Math.min(newImageTopLeftRotated.x + scaledImageSize.width + -cropWindowMaxX, 0),

		y:
			Math.min(cropWindowMinY - newImageTopLeftRotated.y, 0) -
			Math.min(newImageTopLeftRotated.y + scaledImageSize.height - cropWindowMaxY, 0),
	};

	return {
		needsChange: true,
		position: Points.add(
			cropValue.position,
			Points.mul(Points.rotate(correction, cropValue.rotation), 1 / cropWindowSize.height),
		),
		scale: newScale,
	};
}
