<script lang="ts">
	const { name, mode }: { name: string; mode: 'start' | 'end' } = $props();
</script>

{#if mode === 'start'}
	<span style="--h-darker:#FBD93C;--h-rose-pine-dawn:#D2AFB4;">&lt;!--</span>
	<span
		style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"
	>
		{name}
	</span>
{:else}
	<span
		style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit"
	>
		{name}
	</span>
	<span style="--h-darker:#FBD93C;--h-rose-pine-dawn:#D2AFB4;">--&gt;</span>
{/if}
