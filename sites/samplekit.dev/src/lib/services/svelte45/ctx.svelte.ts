import { defineContext } from '$lib/utils/client';
import { Svelte45Controller } from './service.svelte';

const [get, set] = defineContext<Svelte45Controller>();
const createSvelte45Ctx = (hydrationValue: 4 | 5) => set(new Svelte45Controller(hydrationValue));
const useSvelte45Ctx = get;
export { createSvelte45Ctx, useSvelte45Ctx };
