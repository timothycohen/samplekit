<script lang="ts">
	import { Pause, Play } from 'lucide-svelte';
	import type { ActiveIndexStore, Item } from './Slider.svelte';
	import type { Readable } from 'svelte/store';

	export let items: Item[];
	export let activeIndex: ActiveIndexStore;
	export let percentage: Readable<number>;
	export let isPaused: Readable<boolean>;
	export let togglePause: () => void;

	const handleArrowKeys = (e: KeyboardEvent) => {
		if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
			e.preventDefault();
			activeIndex.dec({ focus: true });
		}
		if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
			activeIndex.inc({ focus: true });
		}
	};
</script>

<div class="flex w-full flex-col items-start sm:w-fit sm:flex-row">
	{#each items as { title, description }, i}
		{@const active = $activeIndex === i}
		<div
			role="button"
			tabindex="0"
			aria-label="Tab"
			data-control-id={i}
			aria-expanded={active}
			class="rounded-card w-full p-6 text-left outline-offset-0 transition-all sm:max-w-96
      			 {active ? 'text-gray-12' : 'text-gray-11'}"
			on:click={() => activeIndex.set(i)}
			on:keydown={handleArrowKeys}
		>
			<progress
				class="progress-filled:bg-accent-7 progress-unfilled:bg-gray-4 mb-4 block h-0.5 w-full"
				value={active ? $percentage : 0}
				max={100}
			>
			</progress>

			<span class="text-sm font-light">0{i + 1}.</span>

			<div class="mb-2 flex items-center justify-between">
				<span class="font-medium">{title}</span>
				{#if active}
					<button on:click|stopPropagation={togglePause} class="inline-flex h-5 w-5 items-center justify-center">
						{#if $isPaused}<Play />{:else}<Pause />{/if}
					</button>
				{/if}
			</div>

			{#if active}
				<span class="font-light">{description}</span>
			{/if}
		</div>
	{/each}
</div>
