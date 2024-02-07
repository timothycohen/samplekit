import { turnstileFormInputName } from '../common';
import { turnstileRequired } from '.';
import type { TurnstileStore } from './stores';
import type { Action } from 'svelte/action';
import type { ZodValidation } from 'sveltekit-superforms';
import type { superForm } from 'sveltekit-superforms/client';
import type { ZodObject } from 'zod';

export type TurnstileForm = ReturnType<typeof superForm<ZodValidation<ZodObject<typeof turnstileRequired>>>>['form'];

/**
 * Adds $turnstile to a hidden turnstileFormInputName input.
 *
 * Resets the turnstile when $form['turnstile-used'] is true.
 */
export const turnstileInput: Action<HTMLFormElement, { form: TurnstileForm; turnstile: TurnstileStore }> = (
	node: HTMLFormElement,
	{ form, turnstile }: { form: TurnstileForm; turnstile: TurnstileStore },
) => {
	const inputEl = document.createElement('input');
	inputEl.type = 'hidden';
	inputEl.name = turnstileFormInputName;
	node.appendChild(inputEl);

	const unsubForm = form.subscribe((f) => {
		if (f['turnstile-used']) {
			form.update((f) => {
				f['turnstile-used'] = false;
				return f;
			});
			turnstile.reset();
		}
	});

	const unsubTs = turnstile.subscribe((ts) => {
		inputEl.value = ts ?? '';
	});

	return {
		destroy: () => {
			unsubForm();
			unsubTs();
		},
	};
};
