import { defineCtx } from '$lib/utils/client';
import { storeOnClient } from './sidebarStorage';

class SidebarState {
	#open = $state(false);

	constructor(initialState: boolean) {
		this.#open = initialState;
	}

	get open() {
		return this.#open;
	}

	set open(value: boolean) {
		this.#open = value;
		storeOnClient(value);
	}
}

const [get, set] = defineCtx<SidebarState>();

const createSidebarCtx = (initialState: boolean) => set(new SidebarState(initialState));

/**
 * The source of truth for the sidebar state is the `#sidebar-toggler` checkbox, ensuring changes work without JS.
 * This class is kept in sync by the checkbox so it can be used elsewhere via JS for progressive enhancement.
 *
 * For example,
 * 1) setting a negative tabindex on the sidebar links when closed
 * 2) forcing the menubar to stay visible when sidebar is open
 * 3) syncs with localStorage for persistence
 */
const useSidebarCtx = get;

export { createSidebarCtx, useSidebarCtx };
