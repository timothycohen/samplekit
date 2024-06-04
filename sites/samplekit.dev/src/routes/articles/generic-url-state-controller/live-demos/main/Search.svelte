<script lang="ts">
	import { Search } from '$lib/styles/icons';
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { query },
	} = useSearchAndFilterService();

	export let onSubmit: (e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => void;
</script>

<div class="relative">
	<form method="get" action="/" on:submit={onSubmit}>
		<input
			name="query"
			type="text"
			class="input-text"
			placeholder="Search for products..."
			autocomplete="off"
			value={$query}
		/>
		<button type="submit" class="absolute right-0 top-0 mr-3 flex h-full items-center">
			<Search class="h-4" />
		</button>
	</form>
</div>
