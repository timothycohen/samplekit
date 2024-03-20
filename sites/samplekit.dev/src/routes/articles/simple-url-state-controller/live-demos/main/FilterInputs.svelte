<script lang="ts">
	import { BadgeIcon } from 'lucide-svelte';
	import { minMaxVal } from '$lib/actions';
	import type { SearchParam, SearchParams } from '$lib/stores';

	export let authorNames: string[];
	export let content: SearchParam;
	export let maxDaysOld: SearchParam;
	export let authors: SearchParams;
</script>

<h2 class="text-h4">Filters</h2>
<div>
	<span class="relative">
		Authors
		{#if $authors.length}
			<span class="absolute -right-6 -top-2 h-5 w-5"> <BadgeIcon class="fill-accent-9 h-full w-full" /> </span>
			<span class="text-accent-9-contrast absolute -right-6 -top-2 grid h-5 w-5 place-content-center text-sm">
				{$authors.length}
			</span>
		{/if}
	</span>
	<div class="flex flex-wrap gap-2">
		{#each authorNames as author}
			<button
				class="btn {$authors.includes(author) ? 'btn-accent' : 'btn-hollow'}"
				on:click={() => authors.updateOne(author, 'toggle')}
			>
				{author}
			</button>
		{/each}
		<button
			class="btn {!$authors.length ? 'btn-accent' : 'btn-hollow'}"
			on:click={() => $authors.length && authors.set([])}>All</button
		>
	</div>
</div>

<label class="block">
	Content
	<input bind:value={$content} type="text" class="input-text peer" />
</label>

<label class="block">
	Max Days Old
	<input
		type="number"
		min="1"
		max="14"
		class="input-text peer"
		value={$maxDaysOld}
		on:keydown={(e) => {
			if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
		}}
		on:paste|preventDefault={(e) => {
			$maxDaysOld = e.clipboardData?.getData('text') ?? null;
		}}
		use:minMaxVal={{
			min: 1,
			max: 14,
			onUpdate: (val) => ($maxDaysOld = val),
		}}
	/>
</label>
