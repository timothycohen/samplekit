<script lang="ts">
	import { Gallery, ProductDescription, RelatedProducts } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';

	export let data;

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavService();
	$desktopNav = { menuUnderneath: false, showDrawerToggle: true };
	$desktopDrawer = { showSortAndFilters: false };
	$mobileDrawer = { showSearch: true, showSortAndFilters: false };
</script>

<div class="mx-auto max-w-screen-2xl px-4">
	<div class="border-gray-5 bg-gray-1 rounded-card flex flex-col rounded-lg border p-8 md:p-12 lg:flex-row lg:gap-8">
		<div class="h-full w-full basis-full lg:basis-4/6">
			<Gallery images={data.product.images} />
		</div>

		<div class="basis-full lg:basis-2/6">
			<ProductDescription product={data.product} />
		</div>
	</div>

	<RelatedProducts relatedProducts={data.relatedProducts} />
</div>
