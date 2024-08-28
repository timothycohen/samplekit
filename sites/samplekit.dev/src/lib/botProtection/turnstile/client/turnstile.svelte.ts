import { browser } from '$app/environment';
import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
import { turnstileFormInputName } from '../common';
import type { SuperForm } from '$lib/superforms/client';
import type { RenderParameters } from 'turnstile-types';

export type TurnstileForm = SuperForm<{ 'turnstile-used': boolean }>['form'];
export type TurnstileRenderOpts = {
	superForm: TurnstileForm;
	renderParams?: Partial<Omit<RenderParameters, 'callback' | 'sitekey'>>;
};
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#configurations

/**
 * Holds the response from https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit
 *
 * Exposes a render action and reset method
 *
 * Can add multiple forms and a hidden input will be kept in sync with the turnstile token
 *
 * Renders theme based on document.documentElement.classList
 */
export class Turnstile {
	#store = $state<
		| { state: 'uninitialized' | 'rendering'; id?: never; token?: never }
		| { state: 'ready'; id: string; token?: never }
		| { state: 'complete'; id: string; token: string }
	>({
		state: 'uninitialized',
	});
	#forms: { name: string; form: TurnstileForm; el: HTMLFormElement }[] = $state([]);

	#getOrCreateHiddenInputEl = (formEl: HTMLFormElement) => {
		let inputEl: HTMLInputElement | null = formEl.querySelector(`input[name=${turnstileFormInputName}]`);
		if (!inputEl) {
			inputEl = document.createElement('input');
			inputEl.type = 'hidden';
			inputEl.name = turnstileFormInputName;
			inputEl.value = this.#store.token ?? '';
			formEl.appendChild(inputEl);
		}
		return inputEl;
	};

	#updateInputEl = (token: string) => {
		if (!this.#store.id) throw new Error('Expected turnstile id to be set in render.');
		for (const form of this.#forms) this.#getOrCreateHiddenInputEl(form.el).value = token;
		this.#store = { state: 'complete', id: this.#store.id, token };
	};

	/** Expects window.turnstile to be defined (see TurnstileLoader.svelte) */
	#reset = () => {
		if (!browser) return;
		const id = this.#store?.id;
		if (id) window.turnstile?.reset(id);
	};

	/**
	 * Keeps hidden turnstileFormInputName input in sync with the turnstile token
	 *
	 * Resets the turnstile when $form['turnstile-used'] is true.
	 */
	addForm = (el: HTMLFormElement, opts: { name: string; form: TurnstileForm }) => {
		this.#getOrCreateHiddenInputEl(el);
		this.#forms.push({ name: opts.name, el, form: opts.form });

		const unsubForm = opts.form.subscribe((f) => {
			if (f['turnstile-used']) {
				opts.form.update((f) => {
					f['turnstile-used'] = false;
					return f;
				});
				this.#reset();
			}
		});

		return {
			destroy: () => {
				unsubForm();
				this.#forms = this.#forms.filter((f) => f.name !== opts.name);
			},
		};
	};

	/**
	 * Expects window.turnstile to be defined (see TurnstileLoader.svelte)
	 *
	 * Renders theme based on document.documentElement.classList
	 *
	 */
	render = (
		node: HTMLElement,
		opts?: {
			renderParams?: Partial<Omit<RenderParameters, 'callback' | 'sitekey'>>;
		},
	) => {
		const params: RenderParameters = {
			appearance: 'always',
			language: 'en',
			sitekey: PUBLIC_TURNSTILE_SITE_KEY,
			callback: this.#updateInputEl,
			...opts?.renderParams,
		};

		if (!params.theme) {
			const cl = document.documentElement.classList;
			const themeOnDoc = cl.contains('dark') ? 'dark' : cl.contains('light') ? 'light' : 'auto';
			params.theme = themeOnDoc;
		}

		this.#store = { state: 'rendering' };
		const id = window.turnstile.render(node, params);
		this.#store = { state: 'ready', id };

		return {
			destroy: () => {
				window.turnstile.remove(id);
				this.#store = { state: 'uninitialized' };
			},
		};
	};

	get token() {
		return this.#store.token;
	}
}
