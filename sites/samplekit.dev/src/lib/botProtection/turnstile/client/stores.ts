import { get, writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
import type { Action } from 'svelte/action';
import type { RenderParameters } from 'turnstile-types';

// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#configurations

/**
 * Holds the response from https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit
 *
 * Exposes a render action and reset method
 *
 * Renders theme based on document.documentElement.classList
 *
 * Adding resizeProps will add a listener to resize the iframe on init
 */
export const createTurnstile = (opts?: {
	renderProps?: Partial<RenderParameters>;
	resizeProps?: { width: string; height: string };
}) => {
	const base: { id: string | null; response: string | null } = { id: null, response: null };

	const store = writable({ ...base });

	const defaultRenderProps: RenderParameters = {
		appearance: 'always',
		callback: (token: string) => {
			const old = get(store);
			if (browser && old.id && old.response !== token) {
				store.update((s) => {
					s.response = token;
					return s;
				});
			}
		},
		language: 'en',
		sitekey: PUBLIC_TURNSTILE_SITE_KEY,
	};

	const props: RenderParameters = { ...defaultRenderProps, ...opts?.renderProps };

	const { height, width } = opts?.resizeProps ?? {};

	/** Expects window.turnstile to be defined (see Turnstile.svelte) */
	const render: Action = (node: HTMLElement) => {
		if (!props.theme) {
			const cl = document.documentElement.classList;
			const themeOnDoc = cl.contains('dark') ? 'dark' : cl.contains('light') ? 'light' : 'auto';
			props.theme = themeOnDoc;
		}

		const resizeOnInit = (e: Event) => {
			if (!(e instanceof MessageEvent)) return;
			if (e.data.event !== 'init') return;
			if (props.appearance !== 'always') return;
			if (typeof height !== 'string' || typeof width !== 'string') return;

			const id = get(store).id;
			if (!id) return;
			const turnstileIframe = document.getElementById(id);
			if (!turnstileIframe) return;
			turnstileIframe.style.width = width;
			turnstileIframe.style.height = height;
			turnstileIframe.style.display = '';

			e.stopImmediatePropagation();
		};

		window.addEventListener('message', resizeOnInit);
		const id = window.turnstile.render(node, props);
		store.update((s) => ({ ...s, id }));

		return {
			destroy: () => {
				window.removeEventListener('message', resizeOnInit);
				window.turnstile.remove(id);
				store.set({ ...base });
			},
		};
	};

	/** Expects window.turnstile to be defined (see Turnstile.svelte) */
	const reset = () => {
		const id = get(store).id;
		if (browser && id) window.turnstile?.reset(id);
	};

	return {
		opts,
		subscribe: derived(store, (s) => s.response).subscribe,
		render,
		reset,
	};
};

export type TurnstileStore = ReturnType<typeof createTurnstile>;
