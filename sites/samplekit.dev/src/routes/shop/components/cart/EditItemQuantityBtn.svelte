<script lang="ts">
	import { Minus, Plus } from 'lucide-svelte';
	import { LoadingDots } from '$lib/components';
	import { useCartService } from '$routes/shop/services';
	import type { CartItem } from '$lib/shop';

	export let props: {
		item: CartItem;
		type: 'plus' | 'minus';
		handle?: (res: Awaited<ReturnType<typeof updatingCartItemQty.send>>) => void;
	};

	let localPending = false;

	const { cart, updatingCartItemQty, pending } = useCartService();
</script>

<button
	type="button"
	on:click={async () => {
		if ($pending) return;
		localPending = true;
		updatingCartItemQty
			.send({
				lineId: props.item.id,
				quantity: props.type === 'plus' ? props.item.quantity + 1 : props.item.quantity - 1,
				variantId: props.item.merchandise.id,
			})
			.then((res) => {
				localPending = false;
				if (props.handle) return props.handle(res);
				if (res.error) return console.error(res.error);
				cart.refresh();
			});
	}}
	aria-label={props.type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
	aria-disabled={$pending}
	class="flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:opacity-80
      {$pending ? 'cursor-not-allowed' : ''}
      {props.type === 'minus' ? 'ml-auto' : ''}
  "
>
	{#if localPending}
		<LoadingDots />
	{:else if props.type === 'plus'}
		<Plus class="h-4 w-4" />
	{:else}
		<Minus class="h-4 w-4" />
	{/if}
</button>
