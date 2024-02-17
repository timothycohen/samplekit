<script lang="ts">
	import { X } from 'lucide-svelte';
	import { LoadingDots } from '$lib/components';
	import { logger } from '$lib/logging/client';
	import { useCartService } from '$routes/shop/services';
	import type { Result } from '$lib/utils/common';

	export let props: {
		lineId: string;
		handle?: (res: Result<Result.Success>) => void;
	};

	const { pending, removingCartItem, cart } = useCartService();
</script>

<button
	type="button"
	on:click={async () => {
		if ($pending) return;
		removingCartItem.send({ lineId: props.lineId }).then((res) => {
			if (props.handle) return props.handle(res);
			if (res.error) logger.error(res.error);
			else cart.refresh();
		});
	}}
	aria-label="Remove cart item"
	aria-disabled={$pending}
	class="ease bg-gray-5 hover:bg-accent-9 flex h-4 items-center justify-center rounded-full transition-all duration-200
      {$pending ? 'cursor-not-allowed px-0' : ''}"
>
	{#if $removingCartItem}
		<LoadingDots />
	{:else}
		<X class="hover:text-accent-9-contrast mx-[1px] h-4 w-4" />
	{/if}
</button>
