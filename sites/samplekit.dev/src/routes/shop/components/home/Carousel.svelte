<script lang="ts">
	import { GridTileImage } from '$routes/shop/components';
	import { handleToPath } from '$routes/shop/utils';
	import type { Product } from '$lib/shop';

	export let products: Product[];

	const carouselProducts = [...products, ...products, ...products];
</script>

{#if carouselProducts.length}
	<div class="w-full overflow-x-auto pb-6 pt-1">
		<ul class="animate-carousel flex gap-4">
			{#each carouselProducts as product, i (`${product.handle}${i}`)}
				<li class="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3">
					<a href={handleToPath({ handle: product.handle, kind: 'product' })} class="relative h-full w-full">
						<GridTileImage
							alt={product.title}
							label={{
								title: product.title,
								price: product.priceRange.minVariantPrice,
							}}
							images={product.images.map((i) => i.url)}
							sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
						/>
					</a>
				</li>
			{/each}
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
