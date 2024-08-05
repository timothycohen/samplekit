<script lang="ts">
	import { useTurnstileLoadedFlag } from './turnstileCtx.svelte';
	import type { Turnstile } from './turnstile.svelte';

	const { turnstile }: { turnstile: Turnstile } = $props();
	const turnstileLoaded = useTurnstileLoadedFlag();
	const onload = () => {
		turnstileLoaded.flag = true;
	};
</script>

<svelte:head>
	{#if !turnstileLoaded.flag}
		<script async defer src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" {onload}></script>
		<script>
			// svelte-5-bug hack to force Svelte to track this
		</script>
	{/if}
</svelte:head>

{#if turnstileLoaded.flag}
	<div class="mx-auto mb-4 mt-2 h-[65px] w-[300px]" use:turnstile.render></div>
{/if}
