<!--
  @component

	Runs the turnstile script from cloudflare.com and mutates the global turnstileLoaded flag to ensure the script is only loaded once.

	Once the script has loaded, the Turnstile component renders.

  Ensure `createTurnstileLoadedFlagCtx` has been called in a parent component.
-->

<script lang="ts">
	import { useTurnstileLoadedFlagCtx } from './turnstileLoaded.ctx.svelte';
	import type { Turnstile } from './turnstile.svelte';

	const { turnstile }: { turnstile: Turnstile } = $props();
	const turnstileLoaded = useTurnstileLoadedFlagCtx();
	const onload = () => {
		turnstileLoaded.flag = true;
	};
</script>

<svelte:head>
	{#if !turnstileLoaded.flag}
		<script async defer src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" {onload}></script>
	{/if}
</svelte:head>

{#if turnstileLoaded.flag}
	<div class="mx-auto mb-4 mt-2 h-[65px] w-[300px]" use:turnstile.render></div>
{/if}
