<script lang="ts">
	import { GridTileImage } from '$routes/shop/components';
	import { handleToPath } from '$routes/shop/utils';
	import type { Product } from '$lib/shop';

	interface Props { relatedProducts: Product[] }

	let { relatedProducts }: Props = $props();
</script>

<div class="py-8">
	<h2 class="mb-4 text-2xl font-bold">Related Products</h2>
	<ul class="flex w-full gap-4 overflow-x-auto pt-1">
		{#each relatedProducts as product (product.handle)}
			<li class="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
				<a class="relative h-full w-full" href={handleToPath({ handle: product.handle, kind: 'product' })}>
					<GridTileImage
						alt={product.title}
						label={{
							title: product.title,
							price: product.priceRange.minVariantPrice,
						}}
						images={product.images.map((i) => i.url)}
						sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
					/>
				</a>
			</li>
		{/each}
	</ul>
</div>
