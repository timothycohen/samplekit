import { Turnstile } from '$lib/botProtection/turnstile/client';
import { defineContext } from '$lib/utils/client';

const [get, set] = defineContext<Turnstile>();
export const createTurnstileCtx = () => set(new Turnstile());
export const useTurnstileCtx = get;
