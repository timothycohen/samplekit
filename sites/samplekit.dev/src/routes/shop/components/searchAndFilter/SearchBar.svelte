<script lang="ts">
	import { page } from '$app/stores';
	import { Search } from '$lib/styles/icons';
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { query },
	} = useSearchAndFilterService();

	interface Props {
		action?: App.Form.Action;
		onSubmit?: (
			e: SubmitEvent & {
				currentTarget: EventTarget & HTMLFormElement;
			},
		) => void;
	}

	const {
		action = '/shop/collections/all',
		onSubmit = (e) => {
			e.preventDefault();
			const v = e.currentTarget.querySelector('input')?.value ?? null;
			const isValidPage = $page.url.pathname.includes('/shop/collections/');
			if (isValidPage) query.set(v);
			else query.set(v, { root: '/shop/collections/all', deleteOtherParams: true });
		},
	}: Props = $props();
</script>

<div class="relative">
	<form method="get" {action} onsubmit={onSubmit}>
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
