<script lang="ts">
	import { LoadingDots } from '$lib/components';
	import I from '$lib/icons';
	import { logger } from '$lib/logging/client';
	import { useCartCtx } from '../../cart.ctx.svelte';
	import type { CartItem } from '$lib/shop';

	interface Props {
		props: {
			item: CartItem;
			type: 'plus' | 'minus';
			handle?: (res: Awaited<ReturnType<typeof cart.updateItemQty.send>>) => void;
		};
	}

	const { props }: Props = $props();

	let localPending = $state(false);

	const cart = useCartCtx();
</script>

<button
	type="button"
	onclick={async () => {
		if (cart.submitting) return;
		localPending = true;
		cart.updateItemQty
			.send({
				lineId: props.item.id,
				quantity: props.type === 'plus' ? props.item.quantity + 1 : props.item.quantity - 1,
				variantId: props.item.merchandise.id,
			})
			.then((res) => {
				localPending = false;
				if (props.handle) return props.handle(res);
				if (res.error) return logger.error(res.error);
				cart.refresh();
			});
	}}
	aria-label={props.type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
	aria-disabled={cart.submitting}
	class="flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:opacity-80
      {cart.submitting ? 'cursor-not-allowed' : ''}
      {props.type === 'minus' ? 'ml-auto' : ''}
  "
>
	{#if localPending}
		<LoadingDots />
	{:else if props.type === 'plus'}
		<I.Plus class="h-4 w-4" />
	{:else}
		<I.Minus class="h-4 w-4" />
	{/if}
</button>
