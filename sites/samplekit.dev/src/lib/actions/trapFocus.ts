import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock-upgrade';

// adapted from https://www.npmjs.com/package/svelte-focus-lock/v/1.0.1?activeTab=code

const focus = (el: HTMLElement) => {
	el?.focus();
	// if (el?.isEqualNode(document.activeElement)) return true;
};

const FOCUSABLE_ELEMENTS = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
	'select:not([disabled]):not([aria-hidden])',
	'textarea:not([disabled]):not([aria-hidden])',
	'button:not([disabled]):not([aria-hidden])',
	'iframe',
	'object',
	'embed',
	'[contenteditable]',
	'[tabindex]:not([tabindex^="-"])',
];

/** ### Note: this will return true (and .focus() will fail) when the parent is hidden.
 *
 * #### Okay:
 * ```html
 * <label id="trap-focus" class="hidden">
 *		<input type="checkbox" class="hidden" />
 * </label>
 *```

 * #### Not Okay:
 * ```html
 * <label id="trap-focus" class="hidden">
 *		<input type="checkbox" />
 * </label>
 * ```
 */
const elementIsVisible = (element: HTMLElement) => {
	const computedStyle = document.defaultView?.getComputedStyle(element, null);
	return (
		computedStyle?.getPropertyValue('display') !== 'none' && computedStyle?.getPropertyValue('visibility') !== 'hidden'
	);
};

const getAllFocusableChildren = (node: HTMLElement): HTMLElement[] => {
	const focusables = [...node.querySelectorAll(FOCUSABLE_ELEMENTS.join())].filter(
		(e) => e instanceof HTMLElement,
	) as HTMLElement[];
	return focusables.filter(elementIsVisible);
};

const getAllChildren = (node: HTMLElement): HTMLElement[] =>
	[...node.querySelectorAll('*')].filter((e) => e instanceof HTMLElement) as HTMLElement[];

const getFocusablesFromSelectors = (selectors?: string[]) => {
	const focusables = [] as HTMLElement[];

	if (selectors) {
		for (const s of selectors) {
			for (const n of document.querySelectorAll(s)) {
				if (n instanceof HTMLElement) {
					if (elementIsVisible(n) && n.tabIndex >= 0) focusables.push(n);
					else {
						const children = getAllChildren(n);
						for (const child of children) {
							if (elementIsVisible(child) && child.tabIndex >= 0) {
								focusables.push(child);
								break;
							}
						}
					}
				}
			}
		}
	}

	return focusables;
};

const getAllFocusables = ({
	parent,
	before,
	after,
}: {
	parent: HTMLElement;
	before?: string[];
	after?: string[];
}): HTMLElement[] => {
	const focusables = [
		...getFocusablesFromSelectors(before),
		...getAllFocusableChildren(parent),
		...getFocusablesFromSelectors(after),
	];

	const uniqueFocusables = focusables.filter((v, i, a) => a.findIndex((v2) => v2.isEqualNode(v)) === i);
	return uniqueFocusables;
};

const getCurrentlyFocusedItem = (allFocusableItems: HTMLElement[]): HTMLElement | null => {
	const currentlyFocusedItem = document.activeElement;
	if (!currentlyFocusedItem) return null;
	const inList = allFocusableItems.find((i) => i.isEqualNode(currentlyFocusedItem));
	if (!inList) return null;
	if (!(currentlyFocusedItem instanceof HTMLElement)) return null;
	return currentlyFocusedItem;
};

const getFocusedIndex = (p: { allFocusableItems: HTMLElement[]; currentlyFocusedItem: HTMLElement | null }) =>
	p.currentlyFocusedItem ? p.allFocusableItems.findIndex((i) => i.isEqualNode(p.currentlyFocusedItem)) : -1;

const focusFirstItem = ({ allFocusableItems }: { allFocusableItems: HTMLElement[] }) => {
	const first = allFocusableItems[0];
	if (first) focus(first);
};

const focusLastItem = ({ allFocusableItems }: { allFocusableItems: HTMLElement[] }) => {
	const last = allFocusableItems[allFocusableItems.length - 1];
	if (last) focus(last);
};

const focusNextItem = ({
	allFocusableItems,
	currentlyFocusedItem,
}: {
	allFocusableItems: HTMLElement[];
	currentlyFocusedItem: HTMLElement | null;
}) => {
	const currentlyFocusedIndex = getFocusedIndex({ allFocusableItems, currentlyFocusedItem });
	if (currentlyFocusedIndex === -1) return focusFirstItem({ allFocusableItems });
	if (allFocusableItems.length - 1 === currentlyFocusedIndex) return focusFirstItem({ allFocusableItems });
	const next = allFocusableItems[currentlyFocusedIndex + 1];
	if (next) focus(next);
};

const focusPreviousItem = ({
	allFocusableItems,
	currentlyFocusedItem,
}: {
	allFocusableItems: HTMLElement[];
	currentlyFocusedItem: HTMLElement | null;
}) => {
	const currentlyFocusedIndex = getFocusedIndex({ allFocusableItems, currentlyFocusedItem });
	if (currentlyFocusedIndex === -1) return focusLastItem({ allFocusableItems });
	if (currentlyFocusedIndex === 0) return focusLastItem({ allFocusableItems });
	const prev = allFocusableItems[currentlyFocusedIndex - 1];
	if (prev) focus(prev);
};

const getHandler = (e: KeyboardEvent) => {
	if ((e.key === 'Tab' && !e.shiftKey) || e.key === 'ArrowDown') return focusNextItem;
	if ((e.key === 'Tab' && e.shiftKey) || e.key === 'ArrowUp') return focusPreviousItem;
	if (e.key === 'Home') return focusFirstItem;
	if (e.key === 'End') return focusLastItem;
	return null;
};

const buildListener =
	({ parent, before, after }: { parent: HTMLElement; before?: string[]; after?: string[] }) =>
	(e: KeyboardEvent) => {
		const handler = getHandler(e);
		if (!handler) return;
		e.preventDefault();
		e.stopPropagation();
		const allFocusableItems = getAllFocusables({ parent, before, after });
		handler({ allFocusableItems, currentlyFocusedItem: getCurrentlyFocusedItem(allFocusableItems) });
	};

export const trapFocus = (
	node: HTMLElement,
	opts?: {
		autoFocusIndex?: number;
		restoreFocus?: true;
		lockWindowScroll?: { reserveScrollBarGap: boolean };
		selectorsBefore?: string[];
		selectorsAfter?: string[];
	},
) => {
	const allFocusableItems = getAllFocusables({
		parent: node,
		before: opts?.selectorsBefore,
		after: opts?.selectorsAfter,
	});
	const previousFocus = opts?.restoreFocus ? document.activeElement : null;
	if (!allFocusableItems.length) return { destroy: () => undefined };
	if (opts?.lockWindowScroll)
		disableBodyScroll(node, { reserveScrollBarGap: opts.lockWindowScroll.reserveScrollBarGap });
	if (opts?.autoFocusIndex) {
		const el = allFocusableItems[opts.autoFocusIndex];
		if (el) focus(el);
	}

	const listener = buildListener({ parent: node, before: opts?.selectorsBefore, after: opts?.selectorsAfter });

	document.addEventListener('keydown', listener, true);

	return {
		destroy() {
			document.removeEventListener('keydown', listener, true);
			if (opts?.lockWindowScroll) enableBodyScroll(node);
			if (previousFocus && previousFocus instanceof HTMLElement) focus(previousFocus);
		},
	};
};
