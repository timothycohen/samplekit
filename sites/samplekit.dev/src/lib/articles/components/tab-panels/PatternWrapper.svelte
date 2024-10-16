<script lang="ts">
	import DiagonalLines from './DiagonalLines.svelte';
	import type { WrapperProps } from '$lib/articles/load';
	import type { Snippet } from 'svelte';

	interface Props {
		opts?: WrapperProps | undefined;
		children: Snippet;
	}

	const { opts = undefined, children }: Props = $props();
</script>

<div
	class="relative {opts?.noPadding ? '' : 'p-page'}
	{opts?.noBorder ? '' : 'rounded-b-card border border-gray-9 dark:border-gray-5'}"
>
	{#if opts?.bg}
		<DiagonalLines
			svgClasses="bg-accent-2 h-full w-full inset-0 absolute -z-10 rounded-b-card"
			lineColor="hsl(var(--accent-12))"
			lineOpacity=".10"
			height="16"
			width="16"
		/>
	{/if}

	<div class={opts?.center ? 'grid place-content-center' : ''}>
		{@render children()}
	</div>
</div>
