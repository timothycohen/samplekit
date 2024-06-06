<script lang="ts">
	import { Carousel, ThreeItemGrid } from '$routes/shop/components';
	import { useNavService } from './services';

	const { data } = $props();

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavService();
	$desktopNav = { menuUnderneath: false, showDrawerToggle: true };
	$desktopDrawer = { showSortAndFilters: false };
	$mobileDrawer = { showSearch: true, showSortAndFilters: false };
</script>

<div class="mx-auto mt-4 max-w-screen-2xl">
	<ThreeItemGrid products={data.homepageProducts ?? []} />
</div>

<Carousel products={data.marqueeProducts} />
