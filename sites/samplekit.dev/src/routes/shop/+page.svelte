<script lang="ts">
	import { Carousel, ThreeItemGrid } from './components';
	import { useNavCtx } from './navAndDrawer.ctx';

	const { data } = $props();

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavCtx();
	$desktopNav = { menuUnderneath: false, showDrawerToggle: true };
	$desktopDrawer = { showSortAndFilters: false };
	$mobileDrawer = { showSearch: true, showSortAndFilters: false };
</script>

<div class="mx-auto mt-4 max-w-screen-2xl">
	<ThreeItemGrid products={data.homepageProducts ?? []} />
</div>

<Carousel products={data.marqueeProducts} />
