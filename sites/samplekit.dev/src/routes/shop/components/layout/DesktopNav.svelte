<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	import { MenuIcon } from '$lib/styles/icons';
	import { SearchBar, OpenCartBtn } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';
	import { handleToPath, type MenuWithPath } from '$routes/shop/utils';

	export let menu: MenuWithPath;
	export let collections: { title: string; path: string }[] | undefined = undefined;

	const {
		desktopNav,
		drawerProps: {
			elements: { trigger },
		},
	} = useNavService();

	const limitedMenu = menu.filter((m) => m.title === 'Catalog');
</script>

<nav
	class="sticky top-0 z-50 border-gray-5 bg-app-bg
	{$desktopNav.menuUnderneath ? 'h-[120px]' : 'h-[72px]'}
		w-full self-start overflow-hidden border-b"
>
	<div class="p-4 px-6">
		<div class="grid grid-cols-[1fr_2fr_1fr] items-center gap-16">
			<ul class="flex items-center gap-4">
				<li>
					<a
						href="/shop"
						aria-label="go to shop home page"
						class="font-black tracking-tight text-logo
							{$desktopNav.menuUnderneath ? 'text-xl' : 'text-sm'}"
					>
						SampleKit
					</a>
				</li>
				{#each $desktopNav.menuUnderneath ? limitedMenu : menu as item}
					{@const selected = $page.url.pathname === item.path}
					<li class={$desktopNav.menuUnderneath ? '' : 'text-sm'}>
						<a
							href={item.path}
							data-selected={selected}
							class="text-gray-11 underline-offset-4 hover:text-gray-12 data-[selected=true]:text-gray-12 data-[selected=true]:underline"
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>

			<SearchBar />

			<div class="flex justify-end gap-3">
				{#if $desktopNav.showDrawerToggle}
					<button use:melt={$trigger} class="btn btn-ghost animate-fade-up-and-in p-2">
						<MenuIcon />
					</button>
				{/if}
				<OpenCartBtn />
			</div>
		</div>

		{#if $desktopNav.menuUnderneath && collections?.length}
			<ul class="mx-auto mt-6 flex w-fit flex-wrap gap-4">
				{#each [{ path: handleToPath( { handle: 'all', kind: 'collection' }, ), title: 'All Products' }, ...collections] as collection}
					{@const selected = $page.url.pathname === collection.path}
					<li>
						<a
							href={collection.path}
							data-selected={selected}
							class="text-gray-11 underline-offset-4 hover:text-gray-12 data-[selected=true]:text-gray-12 data-[selected=true]:underline"
						>
							{collection.title}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</nav>

<style>
	nav {
		transition: height 200ms ease-in-out;
	}
</style>
