<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */

	import type { NoPropComponent } from '$lib/utils/common';

	interface Props {
		panel:
			| { rawHTML: string | Promise<string>; component?: never }
			| { rawHTML?: never; component: NoPropComponent | Promise<NoPropComponent> };
	}

	const { panel }: Props = $props();
</script>

{#if panel.component}
	{@const Component = panel.component}
	{#if Component instanceof Promise}{#await Component then C}<C />{/await}
	{:else}<Component />{/if}
{:else if panel.rawHTML}
	{@const rawHTML = panel.rawHTML}
	{#if rawHTML instanceof Promise}{#await rawHTML then html}{@html html}{/await}
	{:else}{@html panel.rawHTML}{/if}
{/if}
