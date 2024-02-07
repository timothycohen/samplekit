<script lang="ts">
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { query },
		reset,
	} = useSearchAndFilterService();
</script>

{#if $query}
	<p class="text-2xl">No results for <span class="font-bold">{$query}</span></p>
	<p class="flex flex-wrap items-center gap-2 text-xl">
		<button class="btn btn-accent inline-block" on:click={() => reset({ filtersOnly: true })}>Erase All Filters</button>
	</p>
{:else}
	<p class="py-3 text-lg">
		Nothing here!
		<button class="btn btn-hollow" on:click={() => reset({ filtersOnly: true })}>Remove Filters</button>
	</p>
{/if}
