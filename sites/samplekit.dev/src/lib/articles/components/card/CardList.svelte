<script lang="ts">
	// TODO: the 'Video Speed Controller' Google Chrome extension is fighting Svelte and throwing an error
	import { fly } from 'svelte/transition';
	import type { FeatureCard } from '$lib/articles/load';

	const { cards }: { cards: FeatureCard[] } = $props();

	let innerWidth = $state(1);

	// css masonry isn't supported yet: https://caniuse.com/?search=masonry
	const cols = $derived(innerWidth >= 1280 ? 3 : innerWidth >= 768 ? 2 : 1);
	const parts = $derived.by(() => {
		const result: FeatureCard[][] = Array.from({ length: cols }, () => []);
		cards.forEach((item, i) => result[i % cols]!.push(item));
		return result;
	});
</script>

<svelte:window bind:innerWidth />

<noscript>
	<div class="flex flex-wrap justify-around gap-4">
		{#each cards as { FeatureCard, metadata }}
			<div class="max-w-96"><FeatureCard {metadata} /></div>
		{/each}
	</div>
</noscript>

{#if innerWidth !== 1}
	<div in:fly={{ y: 20, delay: 100, duration: 400 }} class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
		{#each parts as part}
			<div class="flex flex-col gap-5">
				{#each part as { FeatureCard, metadata }}
					<FeatureCard {metadata} />
				{/each}
			</div>
		{/each}
	</div>
{:else}
	<div class="invisible flex flex-wrap justify-around gap-4">
		{#each cards as { FeatureCard, metadata }}
			<div class="max-w-96"><FeatureCard {metadata} /></div>
		{/each}
	</div>
{/if}
