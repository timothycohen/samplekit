<script lang="ts">
	import type { TurnstileStore } from './stores';

	export let turnstile: TurnstileStore;
	let classes: string | null | undefined = undefined;
	export { classes as class };

	let scriptLoaded = typeof window === 'undefined' ? false : 'turnstile' in window;
	const scriptLoadCallback = () => (scriptLoaded = true);
</script>

<svelte:head>
	{#if !scriptLoaded}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			on:load={scriptLoadCallback}
			defer
			async
		>
		</script>
	{/if}
</svelte:head>

{#if scriptLoaded}
	<div use:turnstile.render class={classes} />
{/if}
