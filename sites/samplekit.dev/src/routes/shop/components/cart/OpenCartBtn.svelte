<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { ShoppingBag } from 'lucide-svelte';
	import { useCartService } from '$routes/shop/services';

	const {
		cart,
		drawerProps: {
			elements: { trigger },
		},
	} = useCartService();
</script>

<button aria-label="Open cart" use:melt={$trigger} class="btn-ghost btn relative p-2">
	<ShoppingBag />
	{#if $cart?.totalQuantity}
		<div
			class="bg-accent-9 text-accent-9-contrast absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-full text-xs font-medium"
		>
			{$cart.totalQuantity}
		</div>
	{/if}
</button>
