<script lang="ts">
	import { create as createConfetti } from 'canvas-confetti';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useWsCtx } from '$lib/ws/client';

	const wsClient = useWsCtx();

	let confettiEl: HTMLCanvasElement | null = $state(null);
	const myConfetti = $derived(confettiEl ? createConfetti(confettiEl) : null);
	const useConfetti = (): void => {
		myConfetti?.({ particleCount: 100, spread: 80, scalar: 0.2 });
	};

	onMount(() => {
		wsClient.confetti.addListener(() => useConfetti());
		return () => wsClient.confetti.removeListener();
	});

	const sendConfettiMsg = () => {
		wsClient.confetti.sendMessage();
	};
</script>

<canvas class="pointer-events-none absolute inset-0 h-full w-full" bind:this={confettiEl}></canvas>

<div class="space-y-8">
	<h2 class="text-center font-serif text-h2 text-accent-12">Confetti</h2>

	<div class="text-center italic text-gray-11">
		{#if !$page.data['user']}
			<a href="/login" class="link font-bold">Sign in</a> to share confetti between
			<strong class="not-italic text-gray-12 underline">all your devices</strong>.
		{:else}
			Broadcasting to <strong class="not-italic text-gray-12 underline">all devices</strong> logged in with the email
			{$page.data['user'].email}.
		{/if}
	</div>

	<div class="text-center">
		<button
			onclick={sendConfettiMsg}
			class="btn-accent h-20 w-20 rounded-full
			       light:bg-accent-9/20 light:hover:bg-accent-10/20 light:focus:bg-accent-10/20
			       dark:bg-accent-9/50 dark:hover:bg-accent-10/50 dark:focus:bg-accent-10/50"
		>
			<span class="text-5xl" aria-label="Confetti">🎊</span>
		</button>
	</div>
</div>
