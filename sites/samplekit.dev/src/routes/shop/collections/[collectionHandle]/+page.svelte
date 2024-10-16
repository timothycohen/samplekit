<script lang="ts">
	import { NoResults, GridTileImage } from '$routes/shop/lib/components';
	import { handleToPath } from '$routes/shop/lib/utils';

	const { data } = $props();
</script>

<section class="h-full">
	{#if data.products.length}
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.products as product}
				<li class="animate-fade-in">
					<a href={handleToPath({ handle: product.handle, kind: 'product' })} class="group ring-accent-9">
						<GridTileImage
							label={{
								title: product.title,
								price: product.priceRange.minVariantPrice,
							}}
							images={product.images.map((i) => ({ src: i.url, alt: i.altText }))}
							sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
						/>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<NoResults />
	{/if}
</section>
