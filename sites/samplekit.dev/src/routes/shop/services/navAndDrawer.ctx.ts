import { createDialog } from '@melt-ui/svelte';
import { get, writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { navigating } from '$app/stores';
import { defineCtx } from '$lib/context';

type DesktopNav = {
	menuUnderneath: boolean;
	showDrawerToggle: boolean;
};
type DesktopDrawer = {
	showSortAndFilters: boolean;
};
type MobileDrawer = {
	showSearch: boolean;
	showSortAndFilters: boolean;
};

const [getCtx, setCtx] = defineCtx<{
	desktopNav: Writable<DesktopNav> & { collapseOnScroll: () => { destroy: () => void } };
	desktopDrawer: Writable<DesktopDrawer>;
	mobileDrawer: Writable<MobileDrawer>;
	drawerProps: ReturnType<typeof createDialog>;
	closeOnNavListener: () => { destroy: () => void };
}>();

const createNavService = () => {
	const createStore = <T>(original: T) => {
		const store = writable<T>(original);
		const set = (value: T) => {
			if (browser) {
				store.set(value);
			}
		};
		const update = (cb: (old: T) => T) => {
			if (browser) {
				store.update(cb);
			}
		};
		return {
			subscribe: store.subscribe,
			set,
			update,
		};
	};

	const desktopNav = createStore({ menuUnderneath: false, showDrawerToggle: false }) as Writable<DesktopNav> & {
		collapseOnScroll: () => { destroy: () => void };
	};
	const desktopDrawer = createStore({ showSortAndFilters: false });
	const mobileDrawer = createStore({ showSearch: false, showSortAndFilters: false });
	const drawerProps = createDialog({ forceVisible: true, preventScroll: false });

	const closeOnNavListener = () => {
		return {
			destroy: navigating.subscribe((value) => {
				if (value?.from?.url.pathname !== value?.to?.url.pathname) {
					drawerProps.states.open.set(false);
				}
			}),
		};
	};

	const collapseOnScroll = () => {
		const resizeListener = () => {
			const scrollY = window.scrollY;
			const showDrawerToggle = get(desktopNav).showDrawerToggle;
			if (scrollY > 112 && !showDrawerToggle) {
				desktopNav.set({ menuUnderneath: false, showDrawerToggle: true });
			} else if (scrollY <= 64 && showDrawerToggle) {
				desktopNav.set({ menuUnderneath: true, showDrawerToggle: false });
			}
		};

		if (browser) window.addEventListener('scroll', resizeListener);
		return {
			destroy: () => {
				if (browser) window.removeEventListener('scroll', resizeListener);
			},
		};
	};

	desktopNav.collapseOnScroll = collapseOnScroll;

	setCtx({ desktopNav, desktopDrawer, mobileDrawer, drawerProps, closeOnNavListener });
};

export { createNavService, getCtx as useNavService };
