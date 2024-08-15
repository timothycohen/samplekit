<script lang="ts">
	import { onMount } from 'svelte';

	const { onAboveViewport }: { onAboveViewport: () => void } = $props();

	let scrollIndicatorEl = $state(null) as unknown as HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0]!.boundingClientRect.bottom < 0) onAboveViewport();
		});

		observer.observe(scrollIndicatorEl);
		return () => {
			observer.disconnect();
		};
	});
</script>

<div bind:this={scrollIndicatorEl} class="scroll-indicator invisible"></div>
