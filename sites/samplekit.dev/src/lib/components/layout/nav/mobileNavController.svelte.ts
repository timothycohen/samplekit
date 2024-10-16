import { keyboard, trapFocus } from '$lib/svelte-actions';

/** ### Progressive enhancement for the mobile nav:
 * 1) Traps the tab focus in the opened menu.
 * 1) Locks the body from scrolling while the menu is open.
 * 1) Adds --scrollbar-width to the document to account for the scroll bar.
 * 1) Makes the opening animation smoother by removing the overflow while animating.
 *
 * Adds a listener on the client to add the following functionality:
 * 1) Allows using escape to get out of the mobile menu.
 * 1) Closes nav on resize if the screen is wide enough.
 */
export class MobileNavController {
	#open = $state(false);
	#transitionWidth: number;
	#animationDuration: number;
	#trapFocus?: { selectorsBefore?: string[]; selectorsAfter?: string[] };
	#getMobileNavEl: () => HTMLElement | null;

	#destroyTrapFocus: (() => void) | null;
	#destroyKeyboardListener: (() => void) | null;
	#destroyResizeListener: (() => void) | null;

	constructor(props: {
		transitionWidth: number;
		animationDuration: number;
		trapFocus?: { selectorsBefore?: string[]; selectorsAfter?: string[] };
		getMobileNavEl: () => HTMLElement | null;
	}) {
		this.#transitionWidth = props.transitionWidth;
		this.#animationDuration = props.animationDuration;
		this.#trapFocus = props.trapFocus;
		this.#getMobileNavEl = props.getMobileNavEl;

		this.#destroyTrapFocus = null;
		this.#destroyKeyboardListener = null;
		this.#destroyResizeListener = null;

		$effect(() => {
			this.#listen();
			return this.#destroy;
		});
	}

	#setOpen = () => {
		if (this.#open) return;
		this.#open = true;
		const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;
		document.documentElement.style.setProperty('--scrollbar-width', scrollBarGap + 'px');
		const mobileNavEl = this.#getMobileNavEl();
		if (mobileNavEl) {
			const destroyTrapFocus = trapFocus(mobileNavEl, {
				lockWindowScroll: { reserveScrollBarGap: true },
				selectorsBefore: this.#trapFocus?.selectorsBefore,
				selectorsAfter: this.#trapFocus?.selectorsAfter,
			}).destroy;

			this.#destroyTrapFocus = () => {
				destroyTrapFocus();
				this.#destroyTrapFocus = null;
			};

			if (this.#animationDuration) {
				mobileNavEl.classList.remove('overflow-y-auto');
				setTimeout(() => mobileNavEl.classList.add('overflow-y-auto'), this.#animationDuration);
			}
		}
	};

	#setClose = () => {
		if (!this.#open) return;
		this.#open = false;
		this.#destroyTrapFocus?.();
		document.documentElement.style.removeProperty('--scrollbar-width');
	};

	#listen = () => {
		if (!this.#destroyKeyboardListener) {
			const destroyKeyboardListener = keyboard(document.body, { Escape: [this.#setClose] }).destroy;
			this.#destroyKeyboardListener = () => {
				destroyKeyboardListener();
				this.#destroyKeyboardListener = null;
			};
		}

		if (!this.#destroyResizeListener) {
			const resizeListener = () => {
				if (window.innerWidth > this.#transitionWidth) this.#setClose();
			};
			window.addEventListener('resize', resizeListener);
			this.#destroyResizeListener = () => {
				window.removeEventListener('resize', resizeListener);
				this.#destroyResizeListener = null;
			};
		}
	};

	#destroy = () => {
		this.#setClose();
		this.#destroyKeyboardListener?.();
		this.#destroyResizeListener?.();
	};

	get open() {
		return this.#open;
	}
	set open(val) {
		if (val) this.#setOpen();
		else this.#setClose();
	}

	toggle = () => (this.#open ? this.#setClose() : this.#setOpen());
}
