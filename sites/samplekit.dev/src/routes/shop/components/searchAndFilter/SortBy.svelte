<script lang="ts">
	import { createSelect } from '@melt-ui/svelte';
	import { Select } from '$lib/components';
	import { useSearchAndFilterCtx } from '../../searchAndFilter.ctx';
	import type { SortItem } from '$lib/shop';

	const {
		params: { sortBy },
	} = useSearchAndFilterCtx();

	const select = createSelect<SortItem['value']>({ selected: sortBy });
</script>

<Select ariaLabel="Sort By" title="Sort by" {select} options={{ 'Sort by': sortBy.items }} />
