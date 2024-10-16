<script lang="ts">
	import { Switch } from '$lib/components';
	import { useSearchAndFilterCtx } from '$routes/shop/lib/ctx';

	const {
		params: { available },
	} = useSearchAndFilterCtx();
</script>

<div class="space-y-2">
	<label class="text-sm font-bold" for="in-stock-only" id="in-stock-only-label">In Stock Only</label>
	<Switch state={$available} id="in-stock-only" classes="block" onClick={available.toggle} />
</div>
