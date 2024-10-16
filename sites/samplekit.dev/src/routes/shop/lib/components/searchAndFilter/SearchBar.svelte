<script lang="ts">
	import { page } from '$app/stores';
	import I from '$lib/icons';
	import { useSearchAndFilterCtx } from '$routes/shop/lib/ctx';

	const {
		params: { query },
	} = useSearchAndFilterCtx();

	interface Props {
		action?: App.Form.Action;
		onsubmit?: (e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) => void;
	}

	const {
		action = '/shop/collections/all',
		onsubmit = (e) => {
			e.preventDefault();
			const v = e.currentTarget.querySelector('input')?.value ?? null;
			const isValidPage = $page.url.pathname.includes('/shop/collections/');
			if (isValidPage) query.set(v);
			else query.set(v, { root: '/shop/collections/all', deleteOtherParams: true });
		},
	}: Props = $props();
</script>

<div class="relative">
	<form method="get" {action} {onsubmit}>
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
