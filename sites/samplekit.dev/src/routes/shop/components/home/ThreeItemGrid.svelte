<script lang="ts">
	import { ThreeItemGridItem } from '$routes/shop/components';
	import type { Product } from '$lib/shop';

	export let products: Product[];

	const [firstProduct, secondProduct, thirdProduct] = products;
</script>

{#if firstProduct && secondProduct && thirdProduct}
	<section class="grid gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2">
		<ThreeItemGridItem size="full" product={firstProduct} loading="eager" />
		<ThreeItemGridItem size="half" product={secondProduct} loading="eager" />
		<ThreeItemGridItem size="half" product={thirdProduct} />
	</section>
{/if}
