<script lang="ts">
	import { Search } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { query },
	} = useSearchAndFilterService();

	export let action: App.Form.Action = '/shop/collections/all';
	export let onSubmit: (
		e: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		},
	) => void = (e) => {
		e.preventDefault();
		const v = e.currentTarget.querySelector('input')?.value ?? null;
		const isValidPage = $page.url.pathname.includes('/shop/collections/');
		if (isValidPage) query.set(v);
		else query.set(v, { root: '/shop/collections/all', deleteOtherParams: true });
	};
</script>

<div class="relative">
	<form method="get" {action} on:submit={onSubmit}>
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
