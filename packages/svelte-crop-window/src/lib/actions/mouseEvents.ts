import { preventDefault } from './handlers.js';

export type MouseDragMove = {
	x: number;
	y: number;
	dx: number;
	dy: number;
	mouseButton: number;
};

export type MouseDragStartEnd = {
	x: number;
	y: number;
	mouseButton: number;
};

export type MouseDraggableActionOptions = {
	onMouseDraggableStart?: (event: MouseDragStartEnd) => void;
	onMouseDraggableMove?: (event: MouseDragMove) => void;
	onMouseDraggableEnd?: (event: MouseDragStartEnd) => void;
};

type MouseDraggableHandler = {
	onmousedown: (event: MouseEvent) => void;
	oncontextmenu: (event: Event) => boolean;
};

export function createMouseDraggableHandler({
	onMouseDraggableStart,
	onMouseDraggableMove,
	onMouseDraggableEnd,
}: MouseDraggableActionOptions): MouseDraggableHandler {
	let x: number | undefined;
	let y: number | undefined;
	let mouseButton: number | undefined;

	function handleDragstart(event: MouseEvent) {
		event.preventDefault();

		if (mouseButton === undefined) {
			mouseButton = event.button;
			onMouseDraggableStart?.({ x: event.x, y: event.y, mouseButton });
			window.addEventListener('mousemove', handleDragmove);
			window.addEventListener('mouseup', handleDragend);
		}
	}

	function handleDragmove(event: MouseEvent) {
		event.preventDefault();

		const dx = event.x - (x || event.x);
		const dy = event.y - (y || event.y);
		x = event.x;
		y = event.y;
		onMouseDraggableMove?.({ x, y, dx, dy, mouseButton: mouseButton! });
	}

	function handleDragend(event: MouseEvent) {
		event.preventDefault();
		x = undefined;
		y = undefined;
		mouseButton = undefined;

		onMouseDraggableEnd?.({ x: event.x, y: event.y, mouseButton: mouseButton! });
		window.removeEventListener('mousemove', handleDragmove);
		window.removeEventListener('mouseup', handleDragend);
	}

	return {
		onmousedown: handleDragstart,
		oncontextmenu: preventDefault,
	};
}
