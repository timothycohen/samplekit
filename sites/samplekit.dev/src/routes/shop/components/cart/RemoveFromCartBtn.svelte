<script lang="ts">
	import { LoadingDots } from '$lib/components';
	import { logger } from '$lib/logging/client';
	import { X } from '$lib/styles/icons';
	import { useCartService } from '$routes/shop/services';
	import type { Result } from '$lib/utils/common';

	interface Props { props: {
		lineId: string;
		handle?: (res: Result<Result.Success>) => void;
	} }

	let { props }: Props = $props();

	const { pending, removingCartItem, cart } = useCartService();
</script>

<button
	type="button"
	onclick={async () => {
		if ($pending) return;
		removingCartItem.send({ lineId: props.lineId }).then((res) => {
			if (props.handle) return props.handle(res);
			if (res.error) logger.error(res.error);
			else cart.refresh();
		});
	}}
	aria-label="Remove cart item"
	aria-disabled={$pending}
	class="ease flex h-4 items-center justify-center rounded-full bg-gray-5 transition-all duration-200 hover:bg-accent-9
      {$pending ? 'cursor-not-allowed px-0' : ''}"
>
	{#if $removingCartItem}
		<LoadingDots />
	{:else}
		<X class="mx-[1px] h-4 w-4 hover:text-accent-9-contrast" />
	{/if}
</button>
