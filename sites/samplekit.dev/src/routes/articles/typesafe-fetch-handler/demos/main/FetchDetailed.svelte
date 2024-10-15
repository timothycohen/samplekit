<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Switch, LoadingDots } from '$lib/components';
	import I from '$lib/icons';
	import { TempValue } from '$lib/stores';
	import LangSelect from './LangSelect.svelte';
	import { type Lang, langOptions } from './lang.service.common';
	import { getRandomColor as get } from './index';

	let currentColor = $state('Yellow');
	let simulateDelay = $state(false);
	let time = $state('');
	let abortController: AbortController | null = $state(null);
	let res: null | Awaited<ReturnType<(typeof get)['send']>> = $state(null);
	let selectedLang: Lang = $state(langOptions.language[0].value.lang);

	const success = new TempValue<true>({ duration: 1500 });

	const getColor = async () => {
		if (selectedLang === undefined) return;
		if (get.submitting) return;
		success.value = null;
		time = '';
		const start = performance.now();
		abortController = new AbortController();
		res = null;
		res = await get.send(
			{ excludeColor: currentColor, lang: selectedLang, simulateDelay },
			{ delayMs: 150, timeoutMs: 3000, abortSignal: abortController.signal },
		);
		abortController = null;
		const perf = performance.now() - start;
		time = perf.toFixed(0);
		if (res.error) return;
		if (perf > 3000) success.value = true;
		currentColor = res.data.color;
	};
</script>

<div class="grid gap-x-12 gap-y-8 p-8 lg:grid-cols-2">
	<div class="grid w-72 items-center gap-4">
		<LangSelect onSelect={(lang) => (selectedLang = lang)} />

		<button class="btn btn-accent transition-colors {get.delayed ? 'cursor-not-allowed' : ''}" onclick={getColor}>
			{#if get.timeout}
				<span class="grid w-[1.625rem] place-content-center" aria-label="Taking longer than usual.">
					<LoadingDots class="bg-accent-1" wrapperClasses="mx-0" />
				</span>
			{:else if get.delayed}
				<span class="grid w-[1.625rem] place-content-center" aria-label="Delayed">
					<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
				</span>
			{:else if success.value}
				<span
					in:fly={{ y: '4px', duration: 400 }}
					class="grid w-[1.625rem] place-content-center"
					aria-label="Succeeded"
				>
					<I.Check class="inline h-5 w-5" />
				</span>
			{:else}
				<span in:fly={{ y: '4px', duration: 400 }} class="w-[1.625rem]">Get</span>
			{/if}
			Random Color
		</button>

		<button class="btn btn-hollow w-full" disabled={!get.delayed} onclick={() => abortController?.abort()}>
			Abort Request
		</button>

		<span class="flex items-center justify-between gap-2">
			<label for="delay-switch">Simulate Delay</label>
			<Switch state={simulateDelay} onClick={() => (simulateDelay = !simulateDelay)} id="delay-switch" />
		</span>
	</div>

	<div class="grid h-full w-72 grid-cols-2 flex-col flex-wrap justify-between text-lg lg:flex">
		<span>Color: {currentColor}</span>
		<div>Loading: {get.submitting}</div>
		<div>Delayed: {get.delayed}</div>
		<div>Timeout: {get.timeout}</div>
		<div class="col-span-2">Performance: {time ? `${time}ms` : ''}</div>
		<div class="col-span-2">Data: {JSON.stringify(res?.data ?? '')}</div>
		<div class="col-span-2">Error: {JSON.stringify(res?.error ?? '')}</div>
	</div>
</div>
