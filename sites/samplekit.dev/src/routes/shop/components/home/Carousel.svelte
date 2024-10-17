<script lang="ts">
	import { handleToPath, type Product } from '$lib/shop';
	import GridTileImage from '../shared/GridTileImage.svelte';

	interface Props {
		products: Product[];
	}

	/*
	 * bug-svelte-5
	 * Doing [...products, ...products, ...products] and then mapping products.images to their url caused Svelte to throw
	 */

	const { products }: Props = $props();
</script>

{#snippet Li(product: Product)}
	<li class="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3">
		<a href={handleToPath({ handle: product.handle, kind: 'product' })} class="relative h-full w-full">
			<GridTileImage
				label={{
					title: product.title,
					price: product.priceRange.minVariantPrice,
				}}
				images={product.images.map((i) => ({ src: i.url, alt: i.altText }))}
				sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
			/>
		</a>
	</li>
{/snippet}

{#if products.length}
	<div class="w-full overflow-x-auto pb-6 pt-1">
		<ul class="animate-carousel flex gap-4">
			{#each products as product, i (`${product.handle}${i}`)}{@render Li(product)}{/each}
			{#each products as product, i (`${product.handle}${products.length + i}`)}{@render Li(product)}{/each}
			{#each products as product, i (`${product.handle}${2 * products.length + i}`)}{@render Li(product)}{/each}
		</ul>
	</div>
{/if}

<style lang="postcss">
	@keyframes marquee {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-100%);
		}
	}

	.animate-carousel {
		animation: marquee 60s linear infinite forwards;
	}
	/* .animate-carousel:hover {
		animation-play-state: paused;
	} */
</style>
