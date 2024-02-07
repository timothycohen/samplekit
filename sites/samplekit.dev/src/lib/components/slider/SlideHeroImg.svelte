<script lang="ts">
	import type { ActiveIndexStore, Item } from './Slider.svelte';

	export let items: Item[];
	export let activeIndex: ActiveIndexStore;
	export let togglePause: () => void;
	export let parentWidth: number;
	export let showNeighbors: boolean;

	$: gap = 0.05 * parentWidth;
	$: margin = 0.1 * parentWidth;
	$: itemWidth = parentWidth - 2 * margin - 2 * gap;
	$: x = margin + gap - $activeIndex * (itemWidth + gap);

	const listenForSwipe = (e: TouchEvent) => {
		const touch = e.touches[0];
		if (!touch) return;

		const { clientX: startX } = touch;

		const move = (e: TouchEvent) => {
			togglePause();
			const touch = e.touches[0];
			if (!touch) return;
			const { clientX: moveX } = touch;
			const diff = moveX - startX;
			const halfwayToPrev = margin + gap - $activeIndex * (itemWidth + gap) - 0.5 * itemWidth;
			const halfwayToNext = margin + gap - $activeIndex * (itemWidth + gap) + 0.5 * itemWidth;
			x = Math.max(Math.min(margin + gap - $activeIndex * (itemWidth + gap) + diff, halfwayToNext), halfwayToPrev);
		};

		const end = (e: TouchEvent) => {
			const touch = e.changedTouches[0];
			if (!touch) return;
			const { clientX: endX } = touch;
			const diff = endX - startX;
			const threshold = 0.25 * itemWidth;

			if (diff < -threshold) {
				togglePause();
				activeIndex.inc();
			} else if (diff > threshold) {
				togglePause();
				activeIndex.dec();
			} else {
				x = margin + gap - $activeIndex * (itemWidth + gap);
			}
			window.removeEventListener('touchmove', move);
			window.removeEventListener('touchend', end);
		};

		window.addEventListener('touchmove', move);
		window.addEventListener('touchend', end);
	};
</script>

<div
	on:touchstart={listenForSwipe}
	class="flex h-full w-full touch-pan-x transition-transform duration-[400ms] motion-reduce:duration-0"
	style="transform: translate3d({x}px, 0px, 0px);"
>
	{#each items as item, i}
		{@const active = i === $activeIndex}
		<div
			data-slide-id={i}
			class="rounded-card bg-app-bg/50 my-8 aspect-[3/2] h-full w-full flex-shrink-0 transition-all
				       {active ? 'shadow-4' : showNeighbors ? 'shadow-3' : 'opacity-0'}"
			style="max-width: {itemWidth}px; margin-right: {gap}px;"
		>
			<!-- svelte-ignore a11y-missing-attribute -->
			<img
				{...item.img}
				loading={i === 0 ? 'eager' : 'lazy'}
				draggable="false"
				class="rounded-card h-full w-full select-none object-contain transition-opacity duration-[400ms]
					 {active ? 'opacity-100' : 'opacity-0'}"
			/>
		</div>
	{/each}
</div>
