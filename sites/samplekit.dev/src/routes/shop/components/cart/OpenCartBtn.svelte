<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { ShoppingBag } from '$lib/styles/icons';
	import { useCartService } from '$routes/shop/services';

	const {
		cart,
		drawerProps: {
			elements: { trigger },
		},
	} = useCartService();
</script>

<button aria-label="Open cart" use:melt={$trigger} class="btn btn-ghost relative p-2">
	<ShoppingBag />
	{#if $cart?.totalQuantity}
		<div
			class="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-full bg-accent-9 text-xs font-medium text-accent-9-contrast"
		>
			{$cart.totalQuantity}
		</div>
	{/if}
</button>
