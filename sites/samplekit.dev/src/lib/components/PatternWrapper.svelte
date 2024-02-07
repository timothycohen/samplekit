<script lang="ts" context="module">
	export type WrapperProps = { bg?: true; center?: true; noBorder?: true; noPadding?: true };
</script>

<script lang="ts">
	import DiagonalLines from './DiagonalLines.svelte';

	export let opts: WrapperProps | undefined = undefined;
</script>

<div
	class="relative flex flex-col {opts?.noPadding ? '' : 'p-page'}
	{opts?.noBorder ? '' : 'border-gray-9 rounded-b-card dark:border-gray-5 border'}"
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
		<slot />
	</div>
</div>
