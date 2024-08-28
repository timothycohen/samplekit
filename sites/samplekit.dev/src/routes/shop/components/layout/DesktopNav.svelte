<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { page } from '$app/stores';
	import I from '$lib/icons';
	import { SearchBar, OpenCartBtn } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';
	import { handleToPath, type MenuWithPath } from '$routes/shop/utils';

	interface Props {
		menu: MenuWithPath;
		collections?: { title: string; path: string }[] | undefined;
	}

	const { menu, collections = undefined }: Props = $props();

	const {
		desktopNav,
		drawerProps: {
			elements: { trigger },
		},
	} = $state(useNavService());

	const limitedMenu = $state(menu.filter((m) => m.title === 'Catalog'));
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
						class="flex h-full font-serif text-gray-12
						{$desktopNav.menuUnderneath ? 'text-xl' : 'text-sm'}"
					>
						<span>Sample.Kit.Shop</span>
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
						<I.Menu />
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
