<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Switch } from '$lib/components';
	import { LoadingDots } from '$lib/components';
	import { createTempStore } from '$lib/stores';
	import { Check, Loader2 } from '$lib/styles/icons';
	import LangSelect from './LangSelect.svelte';
	import { getRandomColor, type Lang } from '.';

	const gettingRandomColor = getRandomColor();
	const { delayed, timeout } = gettingRandomColor;

	let currentColor = 'Yellow';
	let simulateDelay = false;
	let time = '';
	let abortController: AbortController | null = null;
	let res: null | Awaited<ReturnType<(typeof gettingRandomColor)['send']>> = null;
	let selectedLang: Lang;

	const success = createTempStore<true>({ duration: 1500 });

	const getColor = async () => {
		if ($gettingRandomColor) return;
		success.clear();
		time = '';
		const start = performance.now();
		abortController = new AbortController();
		res = null;
		res = await gettingRandomColor.send(
			{ excludeColor: currentColor, lang: selectedLang, simulateDelay },
			{ delayMs: 150, timeoutMs: 3000, abortSignal: abortController.signal },
		);
		abortController = null;
		const perf = performance.now() - start;
		time = perf.toFixed(0);
		if (res.error) return;
		if (perf > 3000) success.set(true);
		currentColor = res.data.color;
	};
</script>

<div class="grid gap-x-12 gap-y-8 lg:grid-cols-2">
	<div class="grid w-72 items-center gap-4">
		<LangSelect bind:selectedLang />

		<button class="btn btn-accent transition-colors {$delayed ? 'cursor-not-allowed' : ''}" on:click={getColor}>
			{#if $timeout}
				<span class="grid w-[1.625rem] place-content-center" aria-label="Taking longer than usual.">
					<LoadingDots class="bg-accent-1" wrapperClasses="mx-0" />
				</span>
			{:else if $delayed}
				<span class="grid w-[1.625rem] place-content-center" aria-label="Delayed">
					<Loader2 class="inline h-5 w-5 animate-spin" />
				</span>
			{:else if $success}
				<span
					in:fly={{ y: '4px', duration: 400 }}
					class="grid w-[1.625rem] place-content-center"
					aria-label="Succeeded"
				>
					<Check class="inline h-5 w-5" />
				</span>
			{:else}
				<span in:fly={{ y: '4px', duration: 400 }} class="w-[1.625rem]">Get</span>
			{/if}
			Random Color
		</button>

		<button class="btn btn-hollow w-full" disabled={!$delayed} on:click={() => abortController?.abort()}>
			Abort Request
		</button>

		<span class="flex items-center justify-between gap-2">
			<label for="delay-switch">Simulate Delay</label>
			<Switch state={simulateDelay} onClick={() => (simulateDelay = !simulateDelay)} id="delay-switch" />
		</span>
	</div>

	<div class="grid h-full w-72 grid-cols-2 flex-col flex-wrap justify-between text-lg lg:flex">
		<span>Color: {currentColor}</span>
		<div>Loading: {$gettingRandomColor}</div>
		<div>Delayed: {$delayed}</div>
		<div>Timeout: {$timeout}</div>
		<div class="col-span-2">Performance: {time ? `${time}ms` : ''}</div>
		<div class="col-span-2">Data: {JSON.stringify(res?.data ?? '')}</div>
		<div class="col-span-2">Error: {JSON.stringify(res?.error ?? '')}</div>
	</div>
</div>
