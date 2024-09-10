<script lang="ts">
	import { page } from '$app/stores';
	import { AddToCartBtn } from '$routes/shop/components';
	import { formatPrice } from '$routes/shop/utils';
	import VariantSelector from './VariantSelector.svelte';
	import type { Product } from '$lib/shop';

	interface Props {
		product: Product;
	}

	const { product }: Props = $props();

	const getVariant = ({ searchParams, optionKeys }: { searchParams: URLSearchParams; optionKeys: string[] }) => {
		return Array.from(searchParams.entries()).reduce<Record<string, string>>((accumulator, [key, value]) => {
			const cleanOption = key.toLowerCase();
			if (!optionKeys.includes(cleanOption)) return accumulator;
			return { ...accumulator, [cleanOption]: value };
		}, {});
	};

	const partialVariant = $derived(
		getVariant({
			searchParams: $page.url.searchParams,
			optionKeys: product.options.map((o) => o.name.toLowerCase()),
		}),
	);
	const selectedVariant = $derived(
		product.variants.length === 1
			? product.variants[0]
			: product.variants.find((variant) =>
					variant.selectedOptions.every(
						(option) => option.value.toLowerCase() === partialVariant[option.name.toLowerCase()],
					),
				),
	);
</script>

<div class="mb-6 flex flex-col space-y-6 border-b border-gray-5 pb-6">
	<h1 class="text-4xl font-medium">{product.title}</h1>
	<p class="w-fit flex-none rounded-full bg-accent-9 p-2 text-sm text-accent-9-contrast">
		{formatPrice(selectedVariant?.price ?? product.priceRange.minVariantPrice)}
		{(selectedVariant?.price ?? product.priceRange.minVariantPrice).currencyCode}
	</p>
</div>

<VariantSelector options={product.options} variants={product.variants} {partialVariant} />

{#if product.descriptionHtml}
	<div class="prose prose-radix my-4">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html product.descriptionHtml}
	</div>
{/if}

<AddToCartBtn props={{ selectedVariant }} />
