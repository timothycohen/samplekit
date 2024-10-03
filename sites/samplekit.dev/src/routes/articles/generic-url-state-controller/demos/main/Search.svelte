<script lang="ts">
	import I from '$lib/icons';
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { query },
	} = useSearchAndFilterService();

	interface Props {
		onsubmit: (e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => void;
	}

	const { onsubmit }: Props = $props();
</script>

<div class="relative">
	<form method="get" action="/" {onsubmit}>
		<input
			name="query"
			type="text"
			class="input-text"
			placeholder="Search for products..."
			autocomplete="off"
			value={$query}
			aria-label="Search for products."
		/>
		<button aria-label="Submit search query" type="submit" class="absolute right-0 top-0 mr-3 flex h-full items-center">
			<I.Search class="h-4" />
		</button>
	</form>
</div>
