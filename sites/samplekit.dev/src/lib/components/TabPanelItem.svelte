<script lang="ts">
	import type { NoPropComponent } from '$lib/utils/common';

	interface Props { panel: 
		| { rawHTML: string | Promise<string>; component?: never }
		| { rawHTML?: never; component: NoPropComponent | Promise<NoPropComponent> } }

	let { panel }: Props = $props();
</script>

{#await Promise.all([panel.component, panel.rawHTML]) then [component, rawHTML]}
	{#if rawHTML}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html rawHTML}
	{:else if component}
		<svelte:component this={component} />
	{/if}
{/await}
