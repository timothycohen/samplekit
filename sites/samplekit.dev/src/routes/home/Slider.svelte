<script lang="ts">
	import I from '$lib/icons';
	import { AccordionSlider } from '$lib/stores';

	const items: Array<{ title: string; description: string; img: { src: string; alt: string } }> = $state([]);

	let windowWidth = $state(768);
	const slider = new AccordionSlider({ itemsLength: items.length, initialParentWidth: 768 });

	$effect(() => {
		if (windowWidth >= 1024) {
			slider.gapPerc = 4;
			slider.marginPerc = 8;
		} else if (windowWidth >= 768) {
			slider.gapPerc = 3;
			slider.marginPerc = 6;
		} else {
			slider.gapPerc = 2;
			slider.marginPerc = 4;
		}
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="overflow-hidden" use:slider.bindParentWidth>
	<div
		{...slider.elSliderRoot}
		class="flex h-full w-full touch-pan-x transition-transform duration-[400ms] motion-reduce:duration-0"
	>
		{#each items as item, i}
			<div
				{...slider.elSliderItem}
				class="my-8 aspect-[3/2] flex-shrink-0 rounded-card bg-app-bg/50 transition-all
				       {slider.activeIndex === i ? 'shadow-4' : 'shadow-3'}"
			>
				<img
					{...item.img}
					loading={i === 0 ? 'eager' : 'lazy'}
					draggable="false"
					class="h-full w-full select-none rounded-card object-contain transition-opacity duration-[400ms]
						 {slider.activeIndex === i ? 'opacity-100' : 'opacity-0'}"
				/>
			</div>
		{/each}
	</div>

	<div>
		<div class="flex flex-col space-y-8 px-page sm:mx-auto sm:w-5/6 sm:flex-row sm:space-x-8 sm:space-y-0 sm:px-0">
			{#each items as { title, description }, i}
				<div
					{...slider.elAccordionTrigger(i)}
					class="rounded-card text-left outline-offset-0 transition-all
								 {slider.activeIndex === i ? 'w-full text-gray-12' : 'text-gray-11'}"
				>
					<progress
						max="100"
						value={slider.activeIndex === i ? slider.progress : 0}
						class="mb-4 block h-0.5 w-full progress-unfilled:bg-gray-4 progress-filled:bg-accent-7"
					></progress>

					<span class="text-xs font-light">0{i + 1}.</span>

					<div class="mb-2 flex items-center justify-between">
						<h2 class="flex-shrink-0 text-lg font-medium">{title}</h2>
						{#if slider.activeIndex === i}
							<span class="inline-flex h-5 w-5 items-center justify-center">
								{#if slider.isPaused}<I.Play />{:else}<I.Pause />{/if}
							</span>
						{/if}
					</div>

					{#if slider.activeIndex === i}
						<span class="font-light">{description}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
