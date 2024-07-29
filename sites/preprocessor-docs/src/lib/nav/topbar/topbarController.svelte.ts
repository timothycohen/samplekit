import { untrack } from 'svelte';
import { browser } from '$app/environment';
import { OPEN_NAV_HEIGHT_PX } from '../consts';

export class TopbarController {
	#topPx = $state(0);
	#borderVisible = $state(browser ? document.documentElement.scrollTop > OPEN_NAV_HEIGHT_PX : false);
	#destroyTopListener = $state(() => {});
	#destroyBorderListener = $state(() => {});

	constructor(r_alwaysOpen: { value: boolean }) {
		$effect(() => {
			if (r_alwaysOpen.value) {
				untrack(() => {
					this.#destroyTopListener();
					this.#destroyBorderListener();
					this.#addBorderListener('one');
				});
			} else {
				untrack(() => {
					this.#addTopListener();
					this.#addBorderListener('navbarHeight');
				});
			}

			return () => {
				this.#destroyTopListener();
				this.#destroyBorderListener();
			};
		});
	}

	#addTopListener() {
		let lastScrollTop = document.documentElement.scrollTop;
		let topPosition = 0;

		const scrollHandler = () => {
			const scrollTop = document.documentElement.scrollTop;
			const scrollDownDistance = scrollTop - lastScrollTop;

			if (scrollDownDistance > 0) {
				topPosition = Math.max(topPosition - scrollDownDistance, -OPEN_NAV_HEIGHT_PX);
				if (scrollTop > OPEN_NAV_HEIGHT_PX) this.#borderVisible = true;
			} else {
				topPosition = Math.min(topPosition - scrollDownDistance, 0);
				if (scrollTop <= 0) this.#borderVisible = false;
			}

			this.#topPx = topPosition;
			lastScrollTop = scrollTop;
		};

		window.addEventListener('scroll', scrollHandler, { passive: true });
		this.#destroyTopListener = () => {
			window.removeEventListener('scroll', scrollHandler);
			this.#topPx = 0;
			this.#destroyTopListener = () => {};
		};
	}

	#addBorderListener(threshold: 'one' | 'navbarHeight') {
		let lastScrollTop = document.documentElement.scrollTop;

		const scrollHandler = () => {
			const scrollTop = document.documentElement.scrollTop;
			const scrollDownDistance = scrollTop - lastScrollTop;

			if (scrollDownDistance > 0) {
				if (scrollTop >= (threshold === 'one' ? 1 : OPEN_NAV_HEIGHT_PX)) this.#borderVisible = true;
			} else {
				if (scrollTop <= 0) this.#borderVisible = false;
			}
			lastScrollTop = scrollTop;
		};

		window.addEventListener('scroll', scrollHandler, { passive: true });
		this.#destroyBorderListener = () => {
			window.removeEventListener('scroll', scrollHandler);
			this.#borderVisible = browser ? document.documentElement.scrollTop > OPEN_NAV_HEIGHT_PX : false;
			this.#destroyBorderListener = () => {};
		};
	}

	get topPx() {
		return this.#topPx;
	}
	get borderVisible() {
		return this.#borderVisible;
	}
}
