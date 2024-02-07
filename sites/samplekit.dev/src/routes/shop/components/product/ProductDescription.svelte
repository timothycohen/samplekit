<script lang="ts">
	import { page } from '$app/stores';
	import { AddToCartBtn } from '$routes/shop/components';
	import { formatPrice } from '$routes/shop/utils';
	import VariantSelector from './VariantSelector.svelte';
	import type { Product } from '$lib/shop';

	export let product: Product;

	const optionKeys = product.options.map((o) => o.name.toLowerCase());

	const getVariant = (searchParams: URLSearchParams) => {
		return Array.from(searchParams.entries()).reduce<Record<string, string>>((accumulator, [key, value]) => {
			const cleanOption = key.toLowerCase();
			if (!optionKeys.includes(cleanOption)) return accumulator;
			return { ...accumulator, [cleanOption]: value };
		}, {});
	};

	$: partialVariant = getVariant($page.url.searchParams);
	$: selectedVariant =
		product.variants.length === 1
			? product.variants[0]
			: product.variants.find((variant) =>
					variant.selectedOptions.every(
						(option) => option.value.toLowerCase() === partialVariant[option.name.toLowerCase()],
					),
				);
</script>

<div class="border-gray-5 mb-6 flex flex-col space-y-6 border-b pb-6">
	<h1 class="text-4xl font-medium">{product.title}</h1>
	<p class="bg-accent-9 text-accent-9-contrast w-fit flex-none rounded-full p-2 text-sm">
		{formatPrice(selectedVariant?.price ?? product.priceRange.minVariantPrice)}
		{(selectedVariant?.price ?? product.priceRange.minVariantPrice).currencyCode}
	</p>
</div>

<VariantSelector options={product.options} variants={product.variants} {partialVariant} />

{#if product.descriptionHtml}
	<div class="prose my-4">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html product.descriptionHtml}
	</div>
{/if}

<AddToCartBtn props={{ selectedVariant }} />
