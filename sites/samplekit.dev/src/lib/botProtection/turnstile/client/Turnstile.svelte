<script lang="ts">
	import type { TurnstileStore } from './stores';

	interface Props { turnstile: TurnstileStore, class?: string | null | undefined }

	let { turnstile, class: classes = undefined }: Props = $props();
	

	let scriptLoaded = $state(typeof window === 'undefined' ? false : 'turnstile' in window);
	const scriptLoadCallback = () => (scriptLoaded = true);
</script>

<svelte:head>
	{#if !scriptLoaded}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			onload={scriptLoadCallback}
			defer
			async
		>
		</script>
	{/if}
</svelte:head>

{#if scriptLoaded}
	<div use:turnstile.render class={classes}></div>
{/if}
