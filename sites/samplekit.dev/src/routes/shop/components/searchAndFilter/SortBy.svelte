<script lang="ts">
	import { createSelect } from '@melt-ui/svelte';
	import { Select } from '$lib/components';
	import { useSearchAndFilterService, type SortItem } from '$routes/shop/services';

	const {
		params: { sortBy },
	} = useSearchAndFilterService();

	const select = createSelect<SortItem['value']>({ selected: sortBy });
</script>

<Select ariaLabel="Sort By" title="Sort by" {select} options={{ 'Sort by': sortBy.items }} />
