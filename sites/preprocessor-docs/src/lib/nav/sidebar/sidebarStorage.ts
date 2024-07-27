import { browser } from '$app/environment';
import { getBrowserCookie, setBrowserCookie } from '$lib/utils/client';

export const STORAGE_KEY_SIDEBAR_STATE = 'sidebar_state';

export const getStoredSidebarOnClient = () => {
	if (!browser) return false;
	const desired = getBrowserCookie('sidebar_state');
	if (desired === 'true') return true;
	if (desired === 'false') return false;
	return window.matchMedia('(min-width: 1024px)').matches;
};

export const storeOnClient = (state: boolean) => {
	setBrowserCookie(STORAGE_KEY_SIDEBAR_STATE, state.toString());
};
