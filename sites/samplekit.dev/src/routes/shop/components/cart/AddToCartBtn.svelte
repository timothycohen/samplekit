<script lang="ts">
	import { LoadingDots } from '$lib/components';
	import { logger } from '$lib/logging/client';
	import { PlusIcon } from '$lib/styles/icons';
	import { useCartService } from '$routes/shop/services';
	import type { Result } from '$lib/utils/common';

	export let props: {
		selectedVariant?: { id: string; availableForSale: boolean };
		handle?: (res: Result<Result.Success>) => void;
	};

	const {
		cart,
		addingCartItem,
		pending,
		drawerProps: {
			states: { open },
		},
	} = useCartService();

	const buttonClasses =
		'relative flex w-full items-center justify-center rounded-full bg-accent-9 text-accent-9-contrast p-4 tracking-wide';
	const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';
</script>

{#if !props.selectedVariant}
	<button type="button" aria-label="Please select an option" class="{buttonClasses} {disabledClasses}">
		<div class="absolute left-0 ml-4">
			<PlusIcon class="h-5" />
		</div>
		Add To Cart
	</button>
{:else if !props.selectedVariant.availableForSale}
	<button type="button" aria-disabled={true} class="{buttonClasses} {disabledClasses}"> Out Of Stock </button>
{:else}
	<button
		type="button"
		on:click={async () => {
			if ($pending || !props.selectedVariant) return;
			addingCartItem.send({ id: props.selectedVariant.id }).then((res) => {
				if (props.handle) return props.handle(res);
				if (res.error) return logger.error(res.error);
				cart.refresh();
				open.set(true);
			});
		}}
		aria-label="Add to cart"
		aria-disabled={$pending}
		class="{buttonClasses} {$pending ? disabledClasses : 'hover:opacity-90'}"
	>
		<div class="absolute left-0 ml-4">
			{#if $addingCartItem}
				<LoadingDots class="bg-gray-12 mb-3" />
			{:else}
				<PlusIcon class="h-5" />
			{/if}
		</div>
		Add To Cart
	</button>
{/if}
