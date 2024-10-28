<script lang="ts">
	import { fly } from 'svelte/transition';
	import { browser } from '$app/environment';
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

	// the invisible SizePlaceholder allocates some space so the scrollbar doesn't jump around
	// it also provides a visible fallback when JavaScript is disabled

	// the browser check prevents hydration errors with extensions that inject into the video element
	// (such as the 'Video Speed Controller' Google Chrome extension)
</script>

<svelte:window bind:innerWidth />

{#snippet SizePlaceholder()}
	<div class="no-script-visible invisible flex flex-wrap justify-around gap-4">
		{#each cards as { FeatureCard, metadata }}
			<div class="max-w-96"><FeatureCard {metadata} /></div>
		{/each}
	</div>
{/snippet}

{#if browser}
	{#if innerWidth !== 1}
		<div in:fly={{ y: 20, duration: 400 }} class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each parts as part}
				<div class="flex flex-col gap-5">
					{#each part as { FeatureCard, metadata }}
						<FeatureCard {metadata} />
					{/each}
				</div>
			{/each}
		</div>
	{/if}
{:else}
	{@render SizePlaceholder()}
{/if}

<noscript>
	<style>
		.no-script-visible {
			visibility: visible;
		}
	</style>
</noscript>
