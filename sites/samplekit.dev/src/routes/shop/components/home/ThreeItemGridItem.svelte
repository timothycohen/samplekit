<script lang="ts">
	import { GridTileImage } from '$routes/shop/components';
	import { handleToPath } from '$routes/shop/utils';
	import type { Product } from '$lib/shop';

	interface Props {
		product: Product;
		size: 'full' | 'half';
		loading?: 'lazy' | 'eager' | undefined;
	}

	const { product, size, loading = undefined }: Props = $props();
</script>

<div class={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}>
	<a
		class="relative block aspect-square h-full w-full"
		href={handleToPath({ handle: product.handle, kind: 'product' })}
	>
		<GridTileImage
			images={product.images.map((i) => i.url)}
			sizes={size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
			{loading}
			alt={product.title}
			label={{
				position: size === 'full' ? 'center' : 'bottom',
				title: product.title,
				price: product.priceRange.minVariantPrice,
			}}
		/>
	</a>
</div>
