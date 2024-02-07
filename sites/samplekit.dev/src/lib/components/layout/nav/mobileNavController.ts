import { get, writable, type Readable, type Writable } from 'svelte/store';
import { keyboard, trapFocus } from '$lib/actions';

/** ### Progressive enhancement for the mobile nav:
 * 1) Traps the tab focus in the opened menu.
 * 1) Locks the body from scrolling while the menu is open.
 * 1) Adds padding to the mobile nav to account for the scroll bar.
 * 1) Makes the opening animation smoother by removing the overflow while animating.
 *
 * Call .listen() on the client to add the following functionality:
 * 1) Allows using escape to get out of the mobile menu.
 * 1) Closes nav on resize if the screen is wide enough.
 */
export class MobileNavController {
	private _open: Writable<boolean>;
	isOpen: Readable<boolean>;

	private transitionWidth: number;
	private animationDuration: number;
	private trapFocus?: { selectorsBefore?: string[]; selectorsAfter?: string[] };
	private getMobileNavEl: () => HTMLElement | null;
	private getHeaderEl: () => HTMLElement | null;

	private destroyTrapFocus: (() => void) | null;
	private destroyKeyboardListener: (() => void) | null;
	private destroyResizeListener: (() => void) | null;

	constructor(props: {
		transitionWidth: number;
		animationDuration: number;
		trapFocus?: { selectorsBefore?: string[]; selectorsAfter?: string[] };
		getMobileNavEl: () => HTMLElement | null;
		getHeaderEl: () => HTMLElement | null;
	}) {
		this._open = writable(false);
		this.isOpen = { subscribe: this._open.subscribe };

		this.transitionWidth = props.transitionWidth;
		this.animationDuration = props.animationDuration;
		this.trapFocus = props.trapFocus;
		this.getMobileNavEl = props.getMobileNavEl;
		this.getHeaderEl = props.getHeaderEl;

		this.destroyTrapFocus = null;
		this.destroyKeyboardListener = null;
		this.destroyResizeListener = null;
	}

	open = () => {
		if (get(this._open)) return;
		this._open.set(true);
		const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;
		const mobileNavEl = this.getMobileNavEl();
		if (mobileNavEl) {
			const destroyTrapFocus = trapFocus(mobileNavEl, {
				lockWindowScroll: { reserveScrollBarGap: true },
				selectorsBefore: this.trapFocus?.selectorsBefore,
				selectorsAfter: this.trapFocus?.selectorsAfter,
			}).destroy;

			this.destroyTrapFocus = () => {
				destroyTrapFocus();
				this.destroyTrapFocus = null;
			};

			if (this.animationDuration) {
				mobileNavEl.classList.remove('overflow-y-auto');
				setTimeout(() => mobileNavEl.classList.add('overflow-y-auto'), this.animationDuration);
			}
		}

		this.getHeaderEl()?.style.setProperty('padding-right', `${scrollBarGap}px`);
	};

	close = () => {
		if (!get(this._open)) return;
		this._open.set(false);
		this.destroyTrapFocus?.();
		this.getHeaderEl()?.style.removeProperty('padding-right');
	};

	toggle = () => (get(this._open) ? this.close() : this.open());

	listen = () => {
		if (!this.destroyKeyboardListener) {
			const destroyKeyboardListener = keyboard(document.body, { Escape: [this.close] }).destroy;
			this.destroyKeyboardListener = () => {
				destroyKeyboardListener();
				this.destroyKeyboardListener = null;
			};
		}

		if (!this.destroyResizeListener) {
			const resizeListener = () => {
				if (window.innerWidth > this.transitionWidth) this.close();
			};
			window.addEventListener('resize', resizeListener);
			this.destroyResizeListener = () => {
				window.removeEventListener('resize', resizeListener);
				this.destroyResizeListener = null;
			};
		}
	};

	destroy = () => {
		this.close();
		this.destroyKeyboardListener?.();
		this.destroyResizeListener?.();
	};
}
