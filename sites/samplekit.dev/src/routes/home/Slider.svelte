<script lang="ts">
	import { createSlider } from '$lib/components';
	import { Pause, Play } from '$lib/styles/icons';

	const items: Array<{ title: string; description: string; img: { src: string; alt: string } }> = $state([]);

	const {
		elements: { root, swiperRoot, accordionRoot, accordionTrigger, playPauseBtn, swiperItem, progress },
		states: {
			playPercentage: { isPaused },
		},
		helpers: { isSelected },
	} = createSlider();
</script>

<div {...root.attrs} use:root.action class="overflow-hidden">
	<div
		{...swiperRoot.attrs}
		use:swiperRoot.action
		class="flex h-full w-full touch-pan-x transition-transform duration-[400ms] motion-reduce:duration-0"
	>
		{#each items as item, i}
			<div
				{...swiperItem.attrs}
				use:swiperItem.action
				class="my-8 aspect-[3/2] flex-shrink-0 rounded-card bg-app-bg/50 transition-all
				       {$isSelected(i) ? 'shadow-4' : 'shadow-3'}"
			>
				<img
					{...item.img}
					loading={i === 0 ? 'eager' : 'lazy'}
					draggable="false"
					class="h-full w-full select-none rounded-card object-contain transition-opacity duration-[400ms]
						 {$isSelected(i) ? 'opacity-100' : 'opacity-0'}"
				/>
			</div>
		{/each}
	</div>

	<div {...accordionRoot.attrs} use:accordionRoot.action>
		<div class="mx-auto flex w-5/6 flex-col sm:flex-row">
			{#each items as { title, description }, i}
				{@const trigger = accordionTrigger(i)}
				{@const prog = progress(i)}
				<div
					{...trigger.attrs}
					use:trigger.action
					class="rounded-card p-6 text-left outline-offset-0 transition-all sm:max-w-96
								 {$isSelected(i) ? 'w-full text-gray-12' : 'min-w-52 text-gray-11'}"
				>
					<progress
						{...prog.attrs}
						use:prog.action
						class="mb-4 block h-0.5 w-full progress-unfilled:bg-gray-4 progress-filled:bg-accent-7"
					></progress>

					<span class="text-sm font-light">0{i + 1}.</span>

					<div class="mb-2 flex items-center justify-between">
						<h2 class="font-medium">{title}</h2>
						{#if $isSelected(i)}
							<button
								{...playPauseBtn.attrs}
								use:playPauseBtn.action
								class="inline-flex h-5 w-5 items-center justify-center"
							>
								{#if $isPaused}<Play />{:else}<Pause />{/if}
							</button>
						{/if}
					</div>

					{#if $isSelected(i)}
						<span class="font-light">{description}</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
