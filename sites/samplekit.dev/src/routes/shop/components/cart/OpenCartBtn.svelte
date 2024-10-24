<script lang="ts">
	import I from '$lib/icons';
	import { useCartCtx } from '../../cart.ctx.svelte';

	const cart = useCartCtx();
</script>

<button
	aria-label="Open cart"
	aria-haspopup="dialog"
	aria-expanded={cart.drawer}
	onclick={() => (cart.drawer = true)}
	class="btn btn-ghost relative p-2"
>
	<I.ShoppingBag />
	{#if cart.value?.totalQuantity}
		<div
			class="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-full bg-accent-9 text-xs font-medium text-accent-9-contrast"
		>
			{cart.value.totalQuantity}
		</div>
	{/if}
</button>
