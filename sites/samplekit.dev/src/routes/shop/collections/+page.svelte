<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
	import { NoResults } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';
	import { handleToPath } from '$routes/shop/utils';

	export let data;

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavService();
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
				<li class="animate-fade-in aspect-square">
					<a class="group" href={handleToPath({ handle: collection.handle, kind: 'collection' })}>
						<span
							class="hover:border-accent-9 rounded-card relative flex h-full w-full items-center justify-center overflow-hidden border-2 border-transparent"
						>
							{#if src}
								<img
									draggable="false"
									class="bg-gray-1 relative h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
									{src}
									alt={collection.title}
								/>
							{/if}
						</span>

						<span class="group-hover:text-accent-9 flex items-center gap-2 py-2 text-xl">
							{collection.title}
							<ArrowRight class="h-6 w-6 transition-transform group-hover:translate-x-1" />
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<NoResults />
	{/if}
</section>
