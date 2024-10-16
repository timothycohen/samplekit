import { defineCtx } from '../defineCtx';
import { Svelte45Controller } from './service.svelte';

const [getCtx, setCtx] = defineCtx<Svelte45Controller>();
const createSvelte45Ctx = (hydrationValue: 4 | 5) => setCtx(new Svelte45Controller(hydrationValue));
const useSvelte45Ctx = getCtx;
export { createSvelte45Ctx, useSvelte45Ctx };
