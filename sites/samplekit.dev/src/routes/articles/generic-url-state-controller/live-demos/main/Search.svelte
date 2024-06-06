<script lang="ts">
	import { Search } from '$lib/styles/icons';
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { query },
	} = useSearchAndFilterService();

	interface Props {
		onSubmit: (e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => void;
	}

	const { onSubmit }: Props = $props();
</script>

<div class="relative">
	<form method="get" action="/" onsubmit={onSubmit}>
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
