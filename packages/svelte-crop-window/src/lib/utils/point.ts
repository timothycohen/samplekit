import type { Point } from './types.js';

export abstract class Points {
	static rotate(p: Point, rotation: number): Point {
		const rot = (rotation / 180) * Math.PI;
		return {
			x: p.x * Math.cos(rot) - p.y * Math.sin(rot),
			y: p.y * Math.cos(rot) + p.x * Math.sin(rot),
		};
	}

	static add(...args: Point[]): Point {
		return args.reduce((acc, arg) => ({ x: acc.x + arg.x, y: acc.y + arg.y }), { x: 0, y: 0 });
	}

	static sub(p: Point, offset: Point): Point {
		return {
			x: p.x - offset.x,
			y: p.y - offset.y,
		};
	}

	static mul(p: Point, v: number): Point {
		return {
			x: p.x * v,
			y: p.y * v,
		};
	}

	static rotateAroundCenter(p: Point, center: Point, rotation: number): Point {
		return Points.add(center, Points.rotate({ x: p.x - center.x, y: p.y - center.y }, rotation));
	}

	static getCenter(a: Point, b: Point): Point {
		return {
			x: (b.x + a.x) / 2,
			y: (b.y + a.y) / 2,
		};
	}

	static getAngle(a: Point, b: Point): number {
		const angle = -Math.atan2(a.y - b.y, b.x - a.x) * (180 / Math.PI);
		return angle < 0 ? angle + 360 : angle;
	}

	static getDistance(a: Point, b: Point): number {
		return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
	}
}
