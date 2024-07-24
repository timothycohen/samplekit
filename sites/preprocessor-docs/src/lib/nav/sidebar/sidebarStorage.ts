import { browser } from '$app/environment';
import { setBrowserCookie } from '$lib/utils/client';
import type { Cookies } from '@sveltejs/kit';

export const STORAGE_KEY_SIDEBAR_STATE = 'sidebar_state';
export const DEFAULT_SIDEBAR_STATE = browser ? window.matchMedia('(min-width: 768px)').matches : false;

export const getOnServer = (cookies: Cookies): boolean => {
	const str = cookies.get(STORAGE_KEY_SIDEBAR_STATE);
	if (str === 'true') return true;
	if (str === 'false') return false;
	return DEFAULT_SIDEBAR_STATE;
};

export const storeOnClient = (state: boolean) => {
	setBrowserCookie(STORAGE_KEY_SIDEBAR_STATE, state.toString());
};
