<script lang="ts">
	import { minMaxVal } from '$lib/actions';
	import I from '$lib/icons';
	import type { SearchParam, SearchParams } from '$lib/stores';

	interface Props {
		authorNames: string[];
		content: SearchParam;
		maxDaysOld: SearchParam;
		authors: SearchParams;
	}

	const { authorNames, content, maxDaysOld, authors }: Props = $props();
</script>

<h2 class="text-h4">Filters</h2>
<div>
	<span class="relative">
		Authors
		{#if $authors.length}
			<span class="absolute -right-6 -top-2 h-5 w-5"> <I.Badge class="h-full w-full fill-accent-9" /> </span>
			<span class="absolute -right-6 -top-2 grid h-5 w-5 place-content-center text-sm text-accent-9-contrast">
				{$authors.length}
			</span>
		{/if}
	</span>
	<div class="flex flex-wrap gap-2">
		{#each authorNames as author}
			<button
				class="btn {$authors.includes(author) ? 'btn-accent' : 'btn-hollow'}"
				onclick={() => authors.updateOne(author, 'toggle')}
			>
				{author}
			</button>
		{/each}
		<button
			class="btn {!$authors.length ? 'btn-accent' : 'btn-hollow'}"
			onclick={() => $authors.length && authors.set([])}>All</button
		>
	</div>
</div>

<label class="block">
	Content
	<input bind:value={$content} type="text" class="peer input-text" />
</label>

<label class="block">
	Max Days Old
	<input
		type="number"
		min="1"
		max="14"
		class="peer input-text"
		value={$maxDaysOld}
		onkeydown={(e) => {
			if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
		}}
		onpaste={(e) => {
			e.preventDefault();

			$maxDaysOld = e.clipboardData?.getData('text') ?? null;
		}}
		use:minMaxVal={{
			min: 1,
			max: 14,
			onUpdate: (val) => ($maxDaysOld = val),
		}}
	/>
</label>
