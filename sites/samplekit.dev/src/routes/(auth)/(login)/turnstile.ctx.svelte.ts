import { Turnstile } from '$lib/botProtection/turnstile/client';
import { defineCtx } from '$lib/svelte-context';

const [getCtx, setCtx] = defineCtx<Turnstile>();
export const createTurnstileCtx = () => setCtx(new Turnstile());
export const useTurnstileCtx = getCtx;
