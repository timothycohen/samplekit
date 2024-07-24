import { keyboard } from '$lib/actions';

export const KeyboardLoop = (() => {
	const prev = (e: KeyboardEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLElement)) return;
		const prev = e.currentTarget.previousElementSibling;
		if (prev instanceof HTMLElement) prev.focus();
		else {
			const last = e.currentTarget.parentElement?.lastElementChild;
			if (last instanceof HTMLElement) last.focus();
		}
	};

	const next = (e: KeyboardEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLElement)) return;
		const next = e.currentTarget.nextElementSibling;
		if (next instanceof HTMLElement) next.focus();
		else {
			const first = e.currentTarget.parentElement?.firstElementChild;
			if (first instanceof HTMLElement) first.focus();
		}
	};

	const arrowKeys = (listenerNode: HTMLElement) => {
		return keyboard(listenerNode, {
			ArrowUp: [prev],
			ArrowDown: [next],
		});
	};

	return { prev, next, arrowKeys };
})();
