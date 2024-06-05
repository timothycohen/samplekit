<script lang="ts" context="module">
	export type WrapperProps = { bg?: true; center?: true; noBorder?: true; noPadding?: true };
</script>

<script lang="ts">
	import DiagonalLines from './DiagonalLines.svelte';

	interface Props { opts?: WrapperProps | undefined, children?: import('svelte').Snippet }

	let { opts = undefined, children }: Props = $props();
</script>

<div
	class="relative flex flex-col {opts?.noPadding ? '' : 'p-page'}
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

	<div class="aspect-video h-full flex-1 {opts?.center ? 'grid place-content-center' : ''}">
		{@render children?.()}
	</div>
</div>
