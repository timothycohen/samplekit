<script lang="ts">
	import type { NoPropComponent } from '$lib/utils/common';

	interface Props {
		panel:
			| { rawHTML: string | Promise<string>; component?: never }
			| { rawHTML?: never; component: NoPropComponent | Promise<NoPropComponent> };
	}

	const { panel }: Props = $props();
</script>

{#await Promise.all([panel.component, panel.rawHTML]) then [Component, rawHTML]}
	{#if rawHTML}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html rawHTML}
	{:else if Component}
		<Component />
	{/if}
{/await}
