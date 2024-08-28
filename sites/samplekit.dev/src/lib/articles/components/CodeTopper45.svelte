<script lang="ts">
	import I from '$lib/icons';
	import CodeTopper from './CodeTopper.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		copyable?: boolean;
		initialCollapsed?: boolean;
		four: Snippet;
		five: Snippet;
	}

	const { title, copyable = true, initialCollapsed = false, four, five }: Props = $props();

	let initial: 4 | 5 = $state(5);
</script>

{#snippet btnContents(number: 4 | 5)}
	<span class="flex items-center">
		<I.Svelte class="h-5 w-5" />
		<span class="font-medium">{number}</span>
	</span>
{/snippet}

{#if initial === 5}
	<CodeTopper {title} {copyable} {initialCollapsed}>
		{#snippet middleIcon({ classes })}
			<button class="{classes} relative" onclick={() => (initial = 4)}>
				{@render btnContents(5)}
			</button>
		{/snippet}
		{@render four()}
	</CodeTopper>
{:else}
	<CodeTopper {title} {copyable} {initialCollapsed}>
		{#snippet middleIcon({ classes })}
			<button class="{classes} relative" onclick={() => (initial = 5)}>
				{@render btnContents(4)}
			</button>
		{/snippet}
		{@render five()}
	</CodeTopper>
{/if}
