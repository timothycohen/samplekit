<script lang="ts">
	import I from '$lib/icons';
	import { NoResults } from '$routes/shop/lib/components';
	import { useNavCtx } from '$routes/shop/lib/ctx';
	import { handleToPath } from '$routes/shop/lib/utils';

	const { data } = $props();

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavCtx();
	$desktopNav = { menuUnderneath: false, showDrawerToggle: false };
	$desktopDrawer = { showSortAndFilters: false };
	$mobileDrawer = { showSearch: true, showSortAndFilters: false };
</script>

<section class="page">
	<h1 class="mb-4 text-4xl">Collections</h1>

	{#if data.collections.length}
		<ul class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.collections as collection}
				{@const src = collection.image?.url ?? collection.firstProductImage?.url}
				<li class="aspect-square animate-fade-in">
					<a class="group" href={handleToPath({ handle: collection.handle, kind: 'collection' })}>
						<span
							class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-card border-2 border-transparent hover:border-accent-9"
						>
							{#if src}
								<img
									draggable="false"
									class="relative h-full w-full bg-gray-1 object-cover transition duration-300 ease-in-out group-hover:scale-105"
									{src}
									alt={collection.title}
								/>
							{/if}
						</span>

						<span class="flex items-center gap-2 py-2 text-xl group-hover:text-accent-9">
							{collection.title}
							<I.ArrowRight class="h-6 w-6 transition-transform group-hover:translate-x-1" />
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<NoResults />
	{/if}
</section>
