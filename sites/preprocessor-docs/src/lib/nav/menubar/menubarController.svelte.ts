import { untrack } from 'svelte';
import { browser } from '$app/environment';
import { navbarHeightPx } from '../consts';

export class MenubarController {
	#topPx = $state(0);
	#border = $state(browser ? document.body.scrollTop > navbarHeightPx : false);
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
		let lastScrollTop = document.body.scrollTop;
		let topPosition = 0;

		const scrollHandler = () => {
			const scrollTop = document.body.scrollTop;
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

		document.body.addEventListener('scroll', scrollHandler, { passive: true });
		this.#destroyTopListener = () => {
			document.body.removeEventListener('scroll', scrollHandler);
			this.#topPx = 0;
			this.#destroyTopListener = () => {};
		};
	}

	#addBorderListener(threshold: 'one' | 'navbarHeight') {
		let lastScrollTop = document.body.scrollTop;

		const scrollHandler = () => {
			const scrollTop = document.body.scrollTop;
			const scrollDownDistance = scrollTop - lastScrollTop;

			if (scrollDownDistance > 0) {
				if (scrollTop >= (threshold === 'one' ? 1 : navbarHeightPx)) this.#border = true;
			} else {
				if (scrollTop <= 0) this.#border = false;
			}
			lastScrollTop = scrollTop;
		};

		document.body.addEventListener('scroll', scrollHandler, { passive: true });
		this.#destroyBorderListener = () => {
			document.body.removeEventListener('scroll', scrollHandler);
			this.#border = browser ? document.body.scrollTop > navbarHeightPx : false;
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
