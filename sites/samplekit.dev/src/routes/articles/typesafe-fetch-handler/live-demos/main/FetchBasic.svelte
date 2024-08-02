<script lang="ts">
	import I from '$lib/icons';
	import LangSelect from './LangSelect.svelte';
	import { getRandomColor, langOptions, type Lang } from '.';

	const gettingRandomColor = getRandomColor();
	const { delayed } = gettingRandomColor;

	let currentColor = $state('Yellow');
	let selectedLang: Lang = $state(langOptions.language[0].value.lang);

	const getColor = async () => {
		if ($gettingRandomColor || !selectedLang) return;
		const { data, error } = await gettingRandomColor.send({ excludeColor: currentColor, lang: selectedLang });
		if (error) return window.alert('How did you break this? 😭');
		currentColor = data.color;
	};
</script>

<div class="grid gap-x-12 gap-y-8">
	<div class="col-span-2 sm:col-span-1">
		<LangSelect onSelect={(lang) => (selectedLang = lang)} />
	</div>

	<button
		class="btn btn-accent col-span-2 transition-colors sm:col-span-1 {$delayed ? 'cursor-not-allowed' : ''}"
		onclick={getColor}
	>
		{#if $delayed}
			<span class="grid w-[1.625rem] place-content-center" aria-label="Delayed">
				<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
			</span>
		{:else}
			<span class="w-[1.625rem]">Get</span>
		{/if}
		Random Color
	</button>

	<span class="col-span-2 text-center text-lg">Color: {currentColor}</span>
</div>
