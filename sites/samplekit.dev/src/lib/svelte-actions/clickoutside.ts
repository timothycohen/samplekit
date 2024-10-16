/**
 * make an element immune by passing in the element, passing in the query selector, or adding the attribute 'data-outclickimmune'
 */
export const clickOutside = (
	node: HTMLElement,
	cbs: {
		onOutclick?: (e: MouseEvent) => void;
		onInclick?: (e: MouseEvent) => void;
		onImmuneclick?: (e: MouseEvent) => void;
	} = {},
	opts?: { immuneNodes?: Array<HTMLElement | null | string> },
) => {
	if (!cbs.onImmuneclick && !cbs.onInclick && !cbs.onOutclick) return;

	const handleClick = (event: MouseEvent) => {
		if (!node) return false;

		const target = event.target;
		if (!(target instanceof HTMLElement)) return false;

		if ('outclickimmune' in target.dataset) {
			return cbs.onImmuneclick?.(event);
		} else if (node.contains(target)) {
			return cbs.onInclick?.(event);
		}

		for (const immuneNode of opts?.immuneNodes ?? []) {
			const immune = typeof immuneNode === 'string' ? document.querySelector(immuneNode) : immuneNode;
			if (!(immune instanceof HTMLElement)) continue;
			if (immune.contains(target)) return cbs.onImmuneclick?.(event);
		}

		return cbs.onOutclick?.(event);
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		},
	};
};
