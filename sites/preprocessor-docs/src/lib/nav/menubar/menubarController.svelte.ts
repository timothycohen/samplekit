import { untrack } from 'svelte';
import { browser } from '$app/environment';
import { navbarHeightPx } from '../consts';

export class MenubarController {
	#topPx = $state(0);
	#border = $state(browser ? scrollY > navbarHeightPx : false);
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
		let lastScrollTop = scrollY;
		let topPosition = 0;

		const scrollHandler = () => {
			const scrollTop = scrollY;
			const scrollDownDistance = scrollTop - lastScrollTop;

			if (scrollDownDistance > 0) {
				topPosition = Math.max(topPosition - scrollDownDistance, -navbarHeightPx);
				if (scrollTop > navbarHeightPx) this.#border = true;
			} else {
				topPosition = Math.min(topPosition - scrollDownDistance, 0);
				if (scrollTop <= 0) this.#border = false;
			}

			this.#topPx = topPosition;
			lastScrollTop = scrollTop;
		};

		document.addEventListener('scroll', scrollHandler, { passive: true });
		this.#destroyTopListener = () => {
			document.removeEventListener('scroll', scrollHandler);
			this.#topPx = 0;
			this.#destroyTopListener = () => {};
		};
	}

	#addBorderListener(threshold: 'one' | 'navbarHeight') {
		let lastScrollTop = scrollY;

		const scrollHandler = () => {
			const scrollTop = scrollY;
			const scrollDownDistance = scrollTop - lastScrollTop;

			if (scrollDownDistance > 0) {
				if (scrollTop >= (threshold === 'one' ? 1 : navbarHeightPx)) this.#border = true;
			} else {
				if (scrollTop <= 0) this.#border = false;
			}
			lastScrollTop = scrollTop;
		};

		document.addEventListener('scroll', scrollHandler, { passive: true });
		this.#destroyBorderListener = () => {
			document.removeEventListener('scroll', scrollHandler);
			this.#border = browser ? scrollY > navbarHeightPx : false;
			this.#destroyBorderListener = () => {};
		};
	}

	get topPx() {
		return this.#topPx;
	}
	get border() {
		return this.#border;
	}
}
