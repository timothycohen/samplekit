<script lang="ts" context="module">
	import { writable, get } from 'svelte/store';
	import type { HTMLImgAttributes } from 'svelte/elements';

	export type Item = { img: HTMLImgAttributes; title: string; description: string };

	const createActiveIndexStore = (itemsLength: number, rootId: string, controlData: string) => {
		const store = writable(0);

		const focus = (i: number) => {
			const rootEl = document.getElementById(rootId);
			const el = rootEl?.querySelector(`[data-${controlData}="${i}"]`) as undefined | HTMLElement | null;
			el?.focus();
		};

		const inc = (opts?: { focus?: true }) => {
			const i = get(store);
			const newVal = i === itemsLength - 1 ? 0 : i + 1;
			store.set(newVal);
			opts?.focus && focus(newVal);
			return newVal;
		};

		const dec = (opts?: { focus?: true }) => {
			const i = get(store);
			const newVal = i === 0 ? itemsLength - 1 : i - 1;
			store.set(newVal);
			opts?.focus && focus(newVal);
			return newVal;
		};

		const set = (i: number, opts?: { focus?: true }) => {
			const newVal = Math.max(0, Math.min(i, itemsLength - 1));
			store.set(newVal);
			opts?.focus && focus(newVal);
			return newVal;
		};

		const update = (fn: (i: number) => number, opts: { focus?: true }) => {
			const i = get(store);
			const newVal = fn(i);
			store.set(newVal);
			opts?.focus && focus(newVal);
			return newVal;
		};

		return { subscribe: store.subscribe, update, set, inc, dec };
	};

	export type ActiveIndexStore = ReturnType<typeof createActiveIndexStore>;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { createPausableTweened } from '$lib/stores';
	import SlideHeroImg from './SlideHeroImg.svelte';
	import SliderAccordion from './SliderAccordion.svelte';

	export let items: Item[];
	export let rootId = 'slider';
	export let showNeighbors = true;
	export let classes: {
		root?: string | null | undefined;
		hero?: string | null | undefined;
		accordion?: string | null | undefined;
	} = {};

	const activeIndex = createActiveIndexStore(items.length, rootId, 'control-id');
	const percentage = createPausableTweened(0, 100, { duration: 7000 });
	const { isFinished, isPaused, value, toggle: togglePause } = percentage;

	let parentWidth = 768;

	onMount(() => {
		const destroyLoop = isFinished.subscribe((finished) => finished && activeIndex.inc());
		const destroyPercentageResetter = activeIndex.subscribe(() => percentage.restart());

		percentage.play();

		return () => {
			destroyLoop();
			destroyPercentageResetter();
			percentage.destroy();
		};
	});
</script>

<div id={rootId} bind:clientWidth={parentWidth} class={classes.root ?? 'overflow-hidden'}>
	<div class={classes.hero ?? ''}>
		<SlideHeroImg {items} {activeIndex} {togglePause} {parentWidth} {showNeighbors} />
	</div>
	<div class={classes.accordion ?? ''}>
		<SliderAccordion {items} {activeIndex} {isPaused} percentage={value} {togglePause} />
	</div>
</div>
