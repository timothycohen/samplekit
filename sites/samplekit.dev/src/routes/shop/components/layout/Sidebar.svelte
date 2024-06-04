<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	import { X } from '$lib/styles/icons';
	import { Available, Price, SearchBar, SortBy } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';
	import { handleToPath } from '$routes/shop/utils';

	export let collections: { title: string; path: string }[] = [];

	const { desktopDrawer, drawerProps, mobileDrawer } = useNavService();

	const {
		elements: { overlay, content, title, close, portalled },
		states: { open },
	} = drawerProps;
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" transition:fade={{ duration: 150 }}></div>

		<div
			use:melt={$content}
			class="shadow-5 bg-app-bg fixed left-0 top-0 z-50 h-screen w-full max-w-sm overflow-y-auto p-6 focus:outline-none"
			transition:fly={{ x: -350, duration: 300, opacity: 1 }}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="btn-ghost absolute right-3 top-3 grid h-6 w-6 place-content-center"
			>
				<X />
			</button>

			<div class="hidden lg:contents">
				{#if $desktopDrawer.showSortAndFilters}
					<div class="mb-12 space-y-4">
						<h2 use:melt={$title} class="text-lg font-medium">Filters</h2>
						<Available />
						<Price />
						<div class="space-y-2">
							<span class="text-sm font-bold">Sort</span>
							<SortBy />
						</div>
					</div>
				{/if}

				{#if collections.length}
					<div class="space-y-4">
						<h2 use:melt={$title} class="text-lg font-medium">Collections</h2>
						<ul class="space-y-2">
							{#each [{ path: handleToPath( { handle: 'all', kind: 'collection' }, ), title: 'All Products' }, ...collections] as collection}
								{@const selected = $page.url.pathname === collection.path}
								<li>
									<a
										href={collection.path}
										data-selected={selected}
										class="text-gray-11 hover:text-gray-12 data-[selected=true]:text-accent-9 under-a underline-offset-4 data-[selected=true]:underline"
									>
										{collection.title}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<div class="contents lg:hidden">
				{#if $mobileDrawer.showSearch}
					<div class="mb-12 space-y-4">
						<h2 use:melt={$title} class="text-lg font-medium">Search</h2>
						<SearchBar />
					</div>
				{/if}

				{#if $mobileDrawer.showSortAndFilters}
					<div class="mb-12 space-y-4">
						<h2 use:melt={$title} class="text-lg font-medium">Filters</h2>
						<Available />
						<Price />
						<div class="space-y-2">
							<span class="text-sm font-bold">Sort</span>
							<SortBy />
						</div>
					</div>
				{/if}

				{#if collections.length}
					<div class="space-y-4">
						<h2 use:melt={$title} class="text-lg font-medium">Collections</h2>
						<ul class="space-y-2">
							{#each [{ path: handleToPath( { handle: 'all', kind: 'collection' }, ), title: 'All Products' }, ...collections] as collection}
								{@const selected = $page.url.pathname === collection.path}
								<li>
									<a
										href={collection.path}
										data-selected={selected}
										class="text-gray-11 hover:text-gray-12 data-[selected=true]:text-accent-9 under-a underline-offset-4 data-[selected=true]:underline"
									>
										{collection.title}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
