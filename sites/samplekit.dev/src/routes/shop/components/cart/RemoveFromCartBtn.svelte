<script lang="ts">
	import { LoadingDots } from '$lib/components';
	import I from '$lib/icons';
	import { logger } from '$lib/logging/client';
	import { useCartCtx } from '$routes/shop/services';
	import type { Result } from '$lib/utils/common';

	interface Props {
		props: {
			lineId: string;
			handle?: (res: Result<Result.Success>) => void;
		};
	}

	const { props }: Props = $props();

	const cart = useCartCtx();
</script>

<button
	type="button"
	onclick={async () => {
		if (cart.submitting) return;
		cart.removeItem.send({ lineId: props.lineId }).then((res) => {
			if (props.handle) return props.handle(res);
			if (res.error) logger.error(res.error);
			else cart.refresh();
		});
	}}
	aria-label="Remove cart item"
	aria-disabled={cart.submitting}
	class="ease flex h-4 items-center justify-center rounded-full bg-gray-5 transition-all duration-200 hover:bg-accent-9
      {cart.submitting ? 'cursor-not-allowed px-0' : ''}"
>
	{#if cart.removeItem.submitting}
		<LoadingDots />
	{:else}
		<I.X class="mx-[1px] h-4 w-4 hover:text-accent-9-contrast" />
	{/if}
</button>
