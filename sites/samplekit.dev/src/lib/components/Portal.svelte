<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Credit:
	 * https://github.com/sveltejs/svelte/issues/3088#issuecomment-505785516
	 */

	const { children, targetSelector }: { children: Snippet; targetSelector: string } = $props();

	let ref = $state(null) as null | HTMLElement;
	let portal = null as null | HTMLDivElement;

	$effect(() => {
		portal = document.createElement('div');
		portal.className = 'portal';
		const target = document.querySelector(targetSelector);
		if (!target) throw new Error(`Target element not found: ${targetSelector}`);
		target.appendChild(portal);
		portal.appendChild(ref!);

		return () => {
			target.removeChild(portal!);
		};
	});
</script>

<div class="portal-clone">
	<div bind:this={ref}>
		{@render children()}
	</div>
</div>

<style>
	.portal-clone {
		display: none;
	}
</style>
